/// <reference path="../workers/globeProtocol.d.ts" />

import { feedStatusColor, setFeedStatus, type FeedStatus } from "@/lib/feedStatus";

// Owns worker, canvas, visibility, and feed lifecycles outside React.

const WORKER_SCRIPT_PATH = "/workers/globeWorker.js";

const QUAKE_FEED_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const QUAKE_REFRESH_MS = 300_000;
const FIRE_FEED_ENDPOINT = "/api/fires"; // served from the always-on server's cache
const FIRE_REFRESH_MS = 600_000;
const FIRE_RETRY_MS = 4_000;

const QUAKE_FIELDS_PER_POINT = 4; // [lat, lon, mag, ageFactor]
const FIRE_FIELDS_PER_POINT = 2; // [lat, lon]
const FIRE_BYTES_PER_POINT = FIRE_FIELDS_PER_POINT * Float32Array.BYTES_PER_ELEMENT;

const MAX_DEVICE_PIXEL_RATIO = 2;
const DEFAULT_DEVICE_PIXEL_RATIO = 1;
const VISIBLE_DOCUMENT_STATE: DocumentVisibilityState = "visible";
const DOCUMENT_VISIBILITY_EVENT = "visibilitychange";
const ACCENT_RGB_PROPERTY = "--accent-rgb";
const FIRE_RGB_PROPERTY = "--fire-rgb";

const ONE_HOUR_MS = 3_600_000;
const ONE_DAY_MS = 86_400_000;
const AGE_FACTOR_UNDER_ONE_HOUR = 1;
const AGE_FACTOR_UNDER_SIX_HOURS = 0.9;
const AGE_FACTOR_UNDER_ONE_DAY = 0.8;
const AGE_FACTOR_UNDER_THREE_DAYS = 0.65;
const MINIMUM_AGE_FACTOR = 0.5;
const SIX_HOURS_IN_HOURS = 6;
const THREE_DAYS_IN_DAYS = 3;

function quakeAgeFactor(timestampMs: number): number {
  if (!timestampMs) return MINIMUM_AGE_FACTOR;
  const age = Date.now() - timestampMs;
  if (age < ONE_HOUR_MS) return AGE_FACTOR_UNDER_ONE_HOUR;
  if (age < SIX_HOURS_IN_HOURS * ONE_HOUR_MS) return AGE_FACTOR_UNDER_SIX_HOURS;
  if (age < ONE_DAY_MS) return AGE_FACTOR_UNDER_ONE_DAY;
  if (age < THREE_DAYS_IN_DAYS * ONE_DAY_MS) return AGE_FACTOR_UNDER_THREE_DAYS;
  return MINIMUM_AGE_FACTOR;
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
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function"
  );
}

type GlobeHudRefs = {
  readonly quakeCountEl: HTMLElement;
  readonly fireCountEl: HTMLElement;
  readonly statusTextEl: HTMLElement;
  readonly statusDotEl: HTMLElement;
};

type GlobeControllerParams = {
  readonly wrap: HTMLDivElement;
  readonly hud: GlobeHudRefs;
};

type GlobeController = {
  start(): void;
  destroy(): void;
};

function writeStatus(hud: GlobeHudRefs, status: FeedStatus): void {
  hud.statusTextEl.textContent = status;
  hud.statusDotEl.style.color = feedStatusColor[status];
}

function updateFeedStatus(hud: GlobeHudRefs, status: FeedStatus): void {
  writeStatus(hud, status);
  setFeedStatus(status);
}

function isTabVisible(): boolean {
  return document.visibilityState === VISIBLE_DOCUMENT_STATE;
}

function readGlobePalette(): GlobePalette {
  const rootStyle = getComputedStyle(document.documentElement);
  return {
    accentRgb: rootStyle.getPropertyValue(ACCENT_RGB_PROPERTY).trim(),
    fireRgb: rootStyle.getPropertyValue(FIRE_RGB_PROPERTY).trim(),
  };
}

class WorkerGlobeController implements GlobeController {
  private readonly canvas: HTMLCanvasElement;
  private readonly worker: Worker;
  private readonly resizeObserver: ResizeObserver;
  private readonly intersectionObserver: IntersectionObserver;
  private readonly devicePixelRatio: number;
  private active = false;
  private onScreen = true;
  private tabVisible = isTabVisible();
  private renderingEnabled = false;
  private quakeIntervalId?: ReturnType<typeof globalThis.setInterval>;
  private fireTimeoutId?: ReturnType<typeof globalThis.setTimeout>;

  constructor(private readonly wrap: HTMLDivElement, private readonly hud: GlobeHudRefs) {
    this.devicePixelRatio = Math.min(
      globalThis.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO,
      MAX_DEVICE_PIXEL_RATIO
    );
    const reducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "block h-full w-full";
    const offscreenCanvas = this.canvas.transferControlToOffscreen();
    this.worker = new Worker(WORKER_SCRIPT_PATH);
    const initMessage: GlobeMainToWorkerMessage = {
      canvas: offscreenCanvas,
      palette: readGlobePalette(),
      reducedMotion,
    };
    this.worker.postMessage(initMessage, [offscreenCanvas]);
    this.wrap.prepend(this.canvas);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.intersectionObserver = new IntersectionObserver(this.handleIntersection, {
      threshold: 0,
    });
  }

  private readonly resize = (): void => {
    const rect = this.wrap.getBoundingClientRect();
    const resizeMessage: GlobeMainToWorkerMessage = {
      width: rect.width,
      height: rect.height,
      dpr: this.devicePixelRatio,
    };
    this.worker.postMessage(resizeMessage);
  };

  private readonly handleIntersection = (entries: IntersectionObserverEntry[]): void => {
    this.onScreen = entries[0]?.isIntersecting ?? true;
    this.syncRendering();
  };

  private readonly handleVisibilityChange = (): void => {
    this.tabVisible = isTabVisible();
    this.syncRendering();
  };

  private syncRendering(): void {
    const enabled = this.active && this.onScreen && this.tabVisible;
    if (enabled === this.renderingEnabled) return;
    this.renderingEnabled = enabled;
    const renderMessage: GlobeMainToWorkerMessage = { enabled };
    this.worker.postMessage(renderMessage);
  }

  private markQuakesOffline(): void {
    if (!this.active) return;
    updateFeedStatus(this.hud, "offline");
  }

  private readonly loadQuakes = async (): Promise<void> => {
    try {
      const response = await fetch(QUAKE_FEED_URL, { cache: "no-store" });
      if (!response.ok) return this.markQuakesOffline();
      const parsed = parseQuakes(await response.json());
      if (!this.active) return;
      this.hud.quakeCountEl.textContent = String(parsed.length / QUAKE_FIELDS_PER_POINT);
      updateFeedStatus(this.hud, "live");
      const buffer = parsed.buffer as ArrayBuffer;
      const quakesMessage: GlobeQuakesMessage = { quakes: buffer };
      this.worker.postMessage(quakesMessage, [buffer]);
    } catch {
      this.markQuakesOffline();
    }
  };

  private readonly loadFires = async (): Promise<void> => {
    let nextLoadDelayMs = FIRE_RETRY_MS;
    try {
      const response = await fetch(FIRE_FEED_ENDPOINT, { cache: "no-store" });
      if (!response.ok) return;
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0 || buffer.byteLength % FIRE_BYTES_PER_POINT !== 0) return;
      if (!this.active) return;
      this.hud.fireCountEl.textContent = String(
        Math.floor(buffer.byteLength / FIRE_BYTES_PER_POINT)
      );
      const firesMessage: GlobeFiresMessage = { fires: buffer };
      this.worker.postMessage(firesMessage, [buffer]);
      nextLoadDelayMs = FIRE_REFRESH_MS;
    } catch {
      // Keep the last successful fire dataset.
    } finally {
      this.scheduleFireLoad(nextLoadDelayMs);
    }
  };

  private scheduleFireLoad(delayMs: number): void {
    if (!this.active) return;
    globalThis.clearTimeout(this.fireTimeoutId);
    this.fireTimeoutId = globalThis.setTimeout(this.loadFires, delayMs);
  }

  start(): void {
    if (this.active) return;
    this.active = true;
    this.resize();
    this.resizeObserver.observe(this.wrap);
    this.intersectionObserver.observe(this.wrap);
    document.addEventListener(DOCUMENT_VISIBILITY_EVENT, this.handleVisibilityChange);
    this.syncRendering();
    void this.loadQuakes();
    void this.loadFires();
    this.quakeIntervalId = globalThis.setInterval(this.loadQuakes, QUAKE_REFRESH_MS);
  }

  destroy(): void {
    this.active = false;
    this.syncRendering();
    globalThis.clearInterval(this.quakeIntervalId);
    globalThis.clearTimeout(this.fireTimeoutId);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener(DOCUMENT_VISIBILITY_EVENT, this.handleVisibilityChange);
    this.worker.terminate();
    this.canvas.remove();
  }
}

export function createGlobeController(params: GlobeControllerParams): GlobeController {
  return new WorkerGlobeController(params.wrap, params.hud);
}
