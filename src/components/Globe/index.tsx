"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { setFeedStatus } from "@/lib/feedStatus";
import { GLOBE_FRAME, GLOBE_HUD as hud } from "./frame";

/**
 * Live globe hero. A single-threaded Canvas 2D port of the SIGINT renderer
 * (orthographic projGlobe + graticule, quake sizing/age from its pointWorker),
 * wired to real USGS seismic and NASA EONET fire data.
 *
 * Honest by construction: HUD counts and status reflect real fetched state. On
 * any feed/parse failure it renders the graticule only, never fake points.
 * Respects prefers-reduced-motion.
 */

// USGS seismic, past 7 days (~2k events): CORS GeoJSON, regenerated every 60s.
// Pull every 5 min (well above the 60s source cadence). The age-fade dims older
// quakes toward 0.5 alpha, so the week reads fresh-to-stale.
const QUAKE_FEED =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const QUAKE_REFRESH_MS = 300_000;

// NASA EONET wildfires: CORS, no API key, curated open fire events. Events span
// days and update through the day, so pull every 30 min (their endpoint is
// no-cache; no point hammering it).
const FIRE_FEED =
  "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=200";
const FIRE_REFRESH_MS = 1_800_000;

const ACCENT = "255,180,84"; // --accent amber rgb: seismic
const FIRE = "255,107,61"; // red-orange (same desaturated palette family): fire

type Quake = { lat: number; lon: number; mag: number; time: number };
type Fire = { lat: number; lon: number };
type Status = "sync" | "live" | "offline";

// SIGINT pointWorker magnitude -> base size (px), scaled down slightly here.
function quakeSize(mag: number): number {
  if (mag < 1) return 1.2;
  if (mag < 2) return 1.5;
  if (mag < 3) return 2;
  if (mag < 4) return 3;
  if (mag < 5) return 4.5;
  if (mag < 6) return 6;
  if (mag < 7) return 8;
  return 10;
}

const HR = 3_600_000;
const DY = 86_400_000;
const HERO_SCALE = 1;

// SIGINT pointWorker stepped age factor: fresher events are brighter.
function quakeAgeFactor(ts: number): number {
  if (!ts) return 0.5;
  const a = Date.now() - ts;
  if (a < HR) return 1;
  if (a < 6 * HR) return 0.9;
  if (a < DY) return 0.8;
  if (a < 3 * DY) return 0.65;
  return 0.5;
}

/** Defensive parse of the USGS GeoJSON. Rejects anything malformed. */
function parseQuakes(json: unknown): Quake[] {
  const features = (json as { features?: unknown })?.features;
  if (!Array.isArray(features)) return [];
  const out: Quake[] = [];
  for (const f of features) {
    const coords = (f as { geometry?: { coordinates?: unknown } })?.geometry
      ?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;
    const props = (f as { properties?: { mag?: unknown; time?: unknown } })
      ?.properties;
    const mag = Number(props?.mag);
    const time = Number(props?.time);
    out.push({
      lat,
      lon,
      mag: Number.isFinite(mag) ? mag : 0,
      time: Number.isFinite(time) ? time : 0,
    });
  }
  return out;
}

/** Defensive parse of EONET wildfire events. Point geometries only. */
function parseFires(json: unknown): Fire[] {
  const events = (json as { events?: unknown })?.events;
  if (!Array.isArray(events)) return [];
  const out: Fire[] = [];
  for (const e of events) {
    const geom = (e as { geometry?: unknown[] })?.geometry;
    const last = Array.isArray(geom) ? geom.at(-1) : null;
    const coords = (last as { coordinates?: unknown })?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;
    out.push({ lat, lon });
  }
  return out;
}

// SIGINT projGlobe (orthographic), inlined. z > 0 means the front hemisphere.
function proj(
  lat: number,
  lon: number,
  cx: number,
  cy: number,
  r: number,
  ry: number,
  rx: number
): { x: number; y: number; z: number } {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180 + ry;
  const x = -Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  const cX = Math.cos(rx);
  const sX = Math.sin(rx);
  const y2 = y * cX - z * sX;
  const z2 = y * sX + z * cX;
  return { x: cx + x * r, y: cy - y2 * r, z: z2 };
}

const TILT = 0.24; // fixed tilt (rx): gentle look down on the globe (north view)

type P = { x: number; y: number; z: number };

/** Stroke one graticule line, breaking at the horizon (z <= 0 is the backside). */
function strokeArc(ctx: CanvasRenderingContext2D, pts: P[], alpha: number): void {
  ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let on = false;
  for (const p of pts) {
    if (p.z <= 0) {
      on = false;
      continue;
    }
    if (on) ctx.lineTo(p.x, p.y);
    else {
      ctx.moveTo(p.x, p.y);
      on = true;
    }
  }
  ctx.stroke();
}

/** Camera/geometry for one frame. */
type View = { cx: number; cy: number; r: number; ry: number };

/** Graticule (parallels + meridians) and the globe rim. */
function drawGlobe(ctx: CanvasRenderingContext2D, v: View): void {
  const { cx, cy, r, ry } = v;
  // Parallels every 20deg (matching SIGINT's gridRenderer). Dense enough that
  // near-pole circles nest into the globe instead of floating as lone ellipses.
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts: P[] = [];
    for (let lon = -180; lon <= 180; lon += 3)
      pts.push(proj(lat, lon, cx, cy, r, ry, TILT));
    strokeArc(ctx, pts, 0.11);
  }
  for (let lon = -180; lon < 180; lon += 30) {
    const pts: P[] = [];
    for (let lat = -90; lat <= 90; lat += 3)
      pts.push(proj(lat, lon, cx, cy, r, ry, TILT));
    strokeArc(ctx, pts, 0.09);
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${ACCENT},0.22)`;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

/** Quake pulses: magnitude -> size, stepped age -> opacity, M>3 glow. */
function drawQuakes(
  ctx: CanvasRenderingContext2D,
  quakes: Quake[],
  v: View,
  t: number,
  reduced: boolean
): void {
  const { cx, cy, r, ry } = v;
  for (let i = 0; i < quakes.length; i++) {
    const q = quakes[i];
    const p = proj(q.lat, q.lon, cx, cy, r, ry, TILT);
    if (p.z <= 0) continue;
    const depthAlpha = 0.4 + p.z * 0.6;
    const af = quakeAgeFactor(q.time);
    const size = quakeSize(q.mag) * HERO_SCALE;

    if (q.mag > 3) {
      const pi = Math.min(1, (q.mag - 3) / 4);
      const pulse = reduced
        ? 1
        : 1 + Math.sin(t * 0.003 + i * 0.7) * (0.1 + pi * 0.2);
      const gr = size * (1.8 + pi * 1.5) * pulse;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
      g.addColorStop(0, `rgba(${ACCENT},0.25)`);
      g.addColorStop(1, `rgba(${ACCENT},0)`);
      ctx.globalAlpha = depthAlpha * af * 0.5;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = depthAlpha * af * 0.85;
    ctx.fillStyle = `rgb(${ACCENT})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Fire pulses (EONET wildfires): uniform red-orange dots with a soft glow. */
function drawFires(
  ctx: CanvasRenderingContext2D,
  fires: Fire[],
  v: View,
  t: number,
  reduced: boolean
): void {
  const { cx, cy, r, ry } = v;
  for (let i = 0; i < fires.length; i++) {
    const f = fires[i];
    const p = proj(f.lat, f.lon, cx, cy, r, ry, TILT);
    if (p.z <= 0) continue;
    const depthAlpha = 0.4 + p.z * 0.6;
    const size = 2.2;
    const pulse = reduced ? 1 : 1 + Math.sin(t * 0.003 + i * 0.9) * 0.25;
    const gr = size * 2 * pulse;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
    g.addColorStop(0, `rgba(${FIRE},0.3)`);
    g.addColorStop(1, `rgba(${FIRE},0)`);
    ctx.globalAlpha = depthAlpha * 0.55;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, gr, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = depthAlpha * 0.9;
    ctx.fillStyle = `rgb(${FIRE})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export const Globe = (): JSX.Element => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quakesRef = useRef<Quake[]>([]);
  const firesRef = useRef<Fire[]>([]);
  const redrawRef = useRef<(() => void) | null>(null);

  const [count, setCount] = useState<number>(0);
  const [fireCount, setFireCount] = useState<number>(0);
  const [status, setStatus] = useState<Status>("sync");

  // Fetch + parse the feed; fail closed to an empty set (graticule only).
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(QUAKE_FEED, { cache: "no-store" });
        if (!res.ok) throw new Error(`feed ${res.status}`);
        const json: unknown = await res.json();
        const quakes = parseQuakes(json);
        if (!active) return;
        quakesRef.current = quakes;
        setCount(quakes.length);
        setStatus("live");
        setFeedStatus("live");
        redrawRef.current?.();
      } catch {
        if (!active) return;
        quakesRef.current = [];
        setCount(0);
        setStatus("offline");
        setFeedStatus("offline");
        redrawRef.current?.();
      }
    };

    load();
    const id = setInterval(load, QUAKE_REFRESH_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Fires (NASA EONET): separate cadence, best-effort. A failure leaves the
  // existing fires and does not flip the feed status (seismic is primary).
  useEffect(() => {
    let active = true;

    const loadFires = async () => {
      try {
        const res = await fetch(FIRE_FEED, { cache: "no-store" });
        if (!res.ok) throw new Error(`fire feed ${res.status}`);
        const json: unknown = await res.json();
        const fires = parseFires(json);
        if (!active) return;
        firesRef.current = fires;
        setFireCount(fires.length);
        redrawRef.current?.();
      } catch {
        if (!active) return;
        firesRef.current = [];
        setFireCount(0);
        redrawRef.current?.();
      }
    };

    loadFires();
    const id = setInterval(loadFires, FIRE_REFRESH_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Render loop. Single-threaded Canvas 2D is plenty here: a few hundred quakes
  // and no land/trails/aircraft, unlike the full SIGINT worker pipeline. The
  // loop only runs while the globe is on screen and the tab is visible, and
  // under reduced-motion it renders once instead of animating.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const reduced = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let W = 0;
    let H = 0;
    let raf = 0;
    let t = 0;
    let ry = 0;
    let running = false;
    let onScreen = true;
    let tabVisible = true;

    const renderFrame = () => {
      const view: View = { cx: W / 2, cy: H / 2, r: Math.min(W, H) * 0.4, ry };
      ctx.clearRect(0, 0, W, H);
      drawGlobe(ctx, view);
      drawFires(ctx, firesRef.current, view, t, reduced);
      drawQuakes(ctx, quakesRef.current, view, t, reduced);
    };

    const loop = () => {
      renderFrame();
      ry += 0.0016;
      t += 16;
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || !onScreen || !tabVisible) return;
      running = true;
      if (reduced) renderFrame();
      else raf = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced || !running) renderFrame();
    };

    // Lets the async feed trigger a repaint when the loop is not running.
    redrawRef.current = () => {
      if (reduced || !running) renderFrame();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      if (tabVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      redrawRef.current = null;
    };
  }, []);

  const statusText =
    status === "live" ? "live" : status === "offline" ? "offline" : "sync";
  const statusColor =
    status === "live"
      ? "var(--live)"
      : status === "offline"
        ? "var(--cyan)"
        : "var(--dim)";

  return (
    <div ref={wrapRef} className={GLOBE_FRAME}>
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* HUD corners pinned with inline styles (robust to Tailwind JIT). */}
      <div className={hud} style={{ top: 14, left: 16 }}>
        <b className="font-medium text-op-muted">SIGINT</b>
        <br />
        USGS + NASA EONET
      </div>
      <div className={hud} style={{ top: 14, right: 16, textAlign: "right" }}>
        seismic <b style={{ color: `rgb(${ACCENT})` }}>{count}</b>
        <br />
        fire <b style={{ color: `rgb(${FIRE})` }}>{fireCount}</b>
      </div>
      <div className={hud} style={{ bottom: 14, left: 16 }}>
        proj: orthographic
      </div>
      <div
        className={hud}
        style={{ bottom: 14, right: 16, textAlign: "right", color: statusColor }}
      >
        ● {statusText}
      </div>
    </div>
  );
};
