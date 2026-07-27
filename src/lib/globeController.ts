/// <reference path="../workers/globeProtocol.ts" />

import { setFeedStatus, type FeedStatus } from "@/lib/feedStatus";

// Owns everything the globe needs to run outside of React: worker lifecycle,
// the real-elapsed-time render clock, resize/visibility/intersection wiring,
// and the two live-feed polling loops. Canvas rendering has no business being
// React-controlled, so this module mounts once (via Globe's one useEffect)
// and updates the HUD by writing directly to the DOM nodes it's handed —
// no React state, no re-renders, for the lifetime of the globe.

const WORKER_SCRIPT_PATH = "/workers/globeWorker.js";

const QUAKE_FEED_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const QUAKE_REFRESH_MS = 300_000;
const FIRE_FEED_ENDPOINT = "/api/fires"; // served from the always-on server's cache
const FIRE_REFRESH_MS = 600_000;

const QUAKE_FIELDS_PER_POINT = 4; // [lat, lon, mag, ageFactor]
const FIRE_FIELDS_PER_POINT = 2; // [lat, lon]
const FIRE_BYTES_PER_POINT = FIRE_FIELDS_PER_POINT * Float32Array.BYTES_PER_ELEMENT;

const MAX_DEVICE_PIXEL_RATIO = 2;
const DEFAULT_DEVICE_PIXEL_RATIO = 1;
const MIN_OFFSCREEN_CANVAS_DIMENSION = 1;
const MIN_MAIN_CANVAS_DIMENSION = 1;

const ONE_HOUR_MS = 3_600_000;
const ONE_DAY_MS = 86_400_000;
const AGE_FACTOR_UNDER_ONE_HOUR = 1;
const AGE_FACTOR_UNDER_SIX_HOURS = 0.9;
const AGE_FACTOR_UNDER_ONE_DAY = 0.8;
const AGE_FACTOR_UNDER_THREE_DAYS = 0.65;
const AGE_FACTOR_OVER_THREE_DAYS = 0.5;
const AGE_FACTOR_UNKNOWN_TIMESTAMP = 0.5;
const SIX_HOURS_IN_HOURS = 6;
const THREE_DAYS_IN_DAYS = 3;

const STATUS_COLOR_LIVE = "var(--live)";
const STATUS_COLOR_OFFLINE = "var(--cyan)";
const STATUS_COLOR_SYNC = "var(--dim)";

function quakeAgeFactor(timestampMs: number): number {
  if (!timestampMs) return AGE_FACTOR_UNKNOWN_TIMESTAMP;
  const age = Date.now() - timestampMs;
  if (age < ONE_HOUR_MS) return AGE_FACTOR_UNDER_ONE_HOUR;
  if (age < SIX_HOURS_IN_HOURS * ONE_HOUR_MS) return AGE_FACTOR_UNDER_SIX_HOURS;
  if (age < ONE_DAY_MS) return AGE_FACTOR_UNDER_ONE_DAY;
  if (age < THREE_DAYS_IN_DAYS * ONE_DAY_MS) return AGE_FACTOR_UNDER_THREE_DAYS;
  return AGE_FACTOR_OVER_THREE_DAYS;
}

// USGS GeoJSON -> Float32Array [lat, lon, mag, ageFactor] * n (defensive).
function parseQuakes(json: unknown): Float32Array {
  const features = (json as { features?: unknown })?.features;
  if (!Array.isArray(features)) return new Float32Array(0);
  const out: number[] = [];
  for (const feature of features) {
    const coordinates = (feature as { geometry?: { coordinates?: unknown } })?.geometry
      ?.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length < 2) continue;
    const lon = Number(coordinates[0]);
    const lat = Number(coordinates[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;
    const properties = (feature as { properties?: { mag?: unknown; time?: unknown } })
      ?.properties;
    const magnitude = Number(properties?.mag);
    const time = Number(properties?.time);
    out.push(
      lat,
      lon,
      Number.isFinite(magnitude) ? magnitude : 0,
      quakeAgeFactor(Number.isFinite(time) ? time : 0)
    );
  }
  return new Float32Array(out);
}

export function supportsWorkerRender(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof OffscreenCanvas.prototype.transferToImageBitmap === "function"
  );
}

export type GlobeHudRefs = {
  readonly quakeCountEl: HTMLElement;
  readonly fireCountEl: HTMLElement;
  readonly statusTextEl: HTMLElement;
  readonly statusDotEl: HTMLElement;
};

export type GlobeControllerParams = {
  readonly wrap: HTMLDivElement;
  readonly canvas: HTMLCanvasElement;
  readonly hud: GlobeHudRefs;
};

export type GlobeController = {
  start(): void;
  destroy(): void;
};

function statusColorFor(status: FeedStatus): string {
  if (status === "live") return STATUS_COLOR_LIVE;
  if (status === "offline") return STATUS_COLOR_OFFLINE;
  return STATUS_COLOR_SYNC;
}

function writeStatus(hud: GlobeHudRefs, status: FeedStatus): void {
  hud.statusTextEl.textContent = status;
  hud.statusDotEl.style.color = statusColorFor(status);
}

export function createGlobeController(params: GlobeControllerParams): GlobeController {
  const { wrap, canvas, hud } = params;

  const mainCtx = canvas.getContext("2d");
  if (!mainCtx) {
    throw new Error("Globe canvas 2d context unavailable");
  }

  const devicePixelRatio = Math.min(
    globalThis.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
    MAX_DEVICE_PIXEL_RATIO
  );
  const reducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const worker = new Worker(WORKER_SCRIPT_PATH);
  const offscreenCanvas = new OffscreenCanvas(MIN_OFFSCREEN_CANVAS_DIMENSION, MIN_OFFSCREEN_CANVAS_DIMENSION);
  const initMessage: GlobeMainToWorkerMessage = { type: "init", canvas: offscreenCanvas };
  worker.postMessage(initMessage, [offscreenCanvas]);

  // The only main-thread paint: clear, then blit the worker's finished bitmap.
  // Clearing first is required - the bitmap has a transparent background, so
  // without it each frame composites over the last and smears on rotation.
  worker.onmessage = (event: MessageEvent<GlobeWorkerToMainMessage>) => {
    if (event.data?.type !== "frame") return;
    const bitmap = event.data.bitmap;
    mainCtx.clearRect(0, 0, canvas.width, canvas.height);
    mainCtx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
  };

  const resize = () => {
    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = Math.max(MIN_MAIN_CANVAS_DIMENSION, Math.round(width * devicePixelRatio));
    canvas.height = Math.max(MIN_MAIN_CANVAS_DIMENSION, Math.round(height * devicePixelRatio));
    const resizeMessage: GlobeMainToWorkerMessage = {
      type: "resize",
      width,
      height,
      dpr: devicePixelRatio,
    };
    worker.postMessage(resizeMessage);
  };
  const resizeObserver = new ResizeObserver(resize);

  let lastFrameTimeMs = 0;
  let animationFrameHandle = 0;
  let running = false;
  let onScreen = true;
  let tabVisible = true;

  const tick = (nowMs: number) => {
    if (!running) return;
    const elapsedMs = lastFrameTimeMs === 0 ? 0 : nowMs - lastFrameTimeMs;
    lastFrameTimeMs = nowMs;
    const frameMessage: GlobeMainToWorkerMessage = {
      type: "frame",
      elapsedMs,
      reduced: reducedMotion,
    };
    worker.postMessage(frameMessage);
    animationFrameHandle = requestAnimationFrame(tick);
  };
  const startClock = () => {
    if (running || !onScreen || !tabVisible) return;
    running = true;
    lastFrameTimeMs = 0;
    animationFrameHandle = requestAnimationFrame(tick);
  };
  const stopClock = () => {
    running = false;
    cancelAnimationFrame(animationFrameHandle);
  };

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      if (onScreen) startClock();
      else stopClock();
    },
    { threshold: 0 }
  );

  const onVisibilityChange = () => {
    tabVisible = document.visibilityState === "visible";
    if (tabVisible) startClock();
    else stopClock();
  };

  let active = false;

  const loadQuakes = async () => {
    try {
      const response = await fetch(QUAKE_FEED_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`quakes ${response.status}`);
      const parsed = parseQuakes(await response.json());
      if (!active) return;
      hud.quakeCountEl.textContent = String(parsed.length / QUAKE_FIELDS_PER_POINT);
      writeStatus(hud, "live");
      setFeedStatus("live");
      const buffer = parsed.buffer as ArrayBuffer;
      const quakesMessage: GlobeMainToWorkerMessage = { type: "quakes", buf: buffer };
      worker.postMessage(quakesMessage, [buffer]);
    } catch {
      if (!active) return;
      writeStatus(hud, "offline");
      setFeedStatus("offline");
    }
  };

  const loadFires = async () => {
    try {
      const response = await fetch(FIRE_FEED_ENDPOINT, { cache: "no-store" });
      if (!response.ok) throw new Error(`fires ${response.status}`);
      const buffer = await response.arrayBuffer();
      if (!active) return;
      hud.fireCountEl.textContent = String(Math.floor(buffer.byteLength / FIRE_BYTES_PER_POINT));
      const firesMessage: GlobeMainToWorkerMessage = { type: "fires", buf: buffer };
      worker.postMessage(firesMessage, [buffer]);
    } catch {
      /* best-effort: leave existing fires */
    }
  };

  let quakeIntervalId: ReturnType<typeof globalThis.setInterval> | undefined;
  let fireIntervalId: ReturnType<typeof globalThis.setInterval> | undefined;

  return {
    start(): void {
      active = true;
      resize();
      resizeObserver.observe(wrap);
      intersectionObserver.observe(wrap);
      document.addEventListener("visibilitychange", onVisibilityChange);
      startClock();

      loadQuakes();
      loadFires();
      quakeIntervalId = globalThis.setInterval(loadQuakes, QUAKE_REFRESH_MS);
      fireIntervalId = globalThis.setInterval(loadFires, FIRE_REFRESH_MS);
    },
    destroy(): void {
      active = false;
      stopClock();
      globalThis.clearInterval(quakeIntervalId);
      globalThis.clearInterval(fireIntervalId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      worker.terminate();
    },
  };
}
