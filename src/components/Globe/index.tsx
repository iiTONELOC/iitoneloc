"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { setFeedStatus } from "@/lib/feedStatus";
import { GLOBE_FRAME, GLOBE_HUD as hud } from "./frame";

// All rendering happens off the main thread in public/workers/globeWorker.js
// (it owns the transferred OffscreenCanvas). This component only: transfers the
// canvas, drives a per-frame tick, blits the worker's bitmap, fetches the feeds
// and streams them to the worker as they arrive. It never draws points.

const QUAKE_FEED =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const QUAKE_REFRESH_MS = 300_000;
const FIRE_ENDPOINT = "/api/fires"; // served from the always-on server's cache
const FIRE_REFRESH_MS = 600_000;
const ACCENT = "255,180,84";
const FIRE = "255,107,61";

type Status = "sync" | "live" | "offline";

const HR = 3_600_000;
const DY = 86_400_000;

function quakeAgeFactor(ts: number): number {
  if (!ts) return 0.5;
  const a = Date.now() - ts;
  if (a < HR) return 1;
  if (a < 6 * HR) return 0.9;
  if (a < DY) return 0.8;
  if (a < 3 * DY) return 0.65;
  return 0.5;
}

// USGS GeoJSON -> Float32Array [lat, lon, mag, ageFactor] * n (defensive).
function parseQuakes(json: unknown): Float32Array {
  const features = (json as { features?: unknown })?.features;
  if (!Array.isArray(features)) return new Float32Array(0);
  const out: number[] = [];
  for (const f of features) {
    const c = (f as { geometry?: { coordinates?: unknown } })?.geometry
      ?.coordinates;
    if (!Array.isArray(c) || c.length < 2) continue;
    const lon = Number(c[0]);
    const lat = Number(c[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;
    const props = (f as { properties?: { mag?: unknown; time?: unknown } })
      ?.properties;
    const mag = Number(props?.mag);
    const time = Number(props?.time);
    out.push(
      lat,
      lon,
      Number.isFinite(mag) ? mag : 0,
      quakeAgeFactor(Number.isFinite(time) ? time : 0)
    );
  }
  return new Float32Array(out);
}

function supportsWorkerRender(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof OffscreenCanvas.prototype.transferToImageBitmap === "function"
  );
}

export const Globe = (): JSX.Element => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [count, setCount] = useState<number>(0);
  const [fireCount, setFireCount] = useState<number>(0);
  const [status, setStatus] = useState<Status>("sync");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const mainCtx = canvas.getContext("2d");
    if (!mainCtx || !supportsWorkerRender()) return;

    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const reduced = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const worker = new Worker("/workers/globeWorker.js");
    const offscreen = new OffscreenCanvas(1, 1);
    worker.postMessage({ type: "init", canvas: offscreen }, [offscreen]);

    // The only main-thread paint: clear, then blit the worker's finished bitmap.
    // Clearing first is required - the bitmap has a transparent background, so
    // without it each frame composites over the last and smears on rotation.
    worker.onmessage = (e: MessageEvent) => {
      if (e.data?.type !== "frame") return;
      const bmp: ImageBitmap = e.data.bitmap;
      mainCtx.clearRect(0, 0, canvas.width, canvas.height);
      mainCtx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close();
    };

    let W = 0;
    let H = 0;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      worker.postMessage({ type: "resize", W, H, dpr });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let t = 0;
    let raf = 0;
    let running = false;
    let onScreen = true;
    let tabVisible = true;
    const loop = () => {
      if (!running) return;
      worker.postMessage({ type: "frame", t, reduced });
      if (!reduced) t += 16;
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || !onScreen || !tabVisible) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

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

    let active = true;

    const loadQuakes = async () => {
      try {
        const res = await fetch(QUAKE_FEED, { cache: "no-store" });
        if (!res.ok) throw new Error(`quakes ${res.status}`);
        const arr = parseQuakes(await res.json());
        if (!active) return;
        setCount(arr.length / 4);
        setStatus("live");
        setFeedStatus("live");
        const buf = arr.buffer;
        worker.postMessage({ type: "quakes", buf }, [buf]);
      } catch {
        if (!active) return;
        setStatus("offline");
        setFeedStatus("offline");
      }
    };

    const loadFires = async () => {
      try {
        const res = await fetch(FIRE_ENDPOINT, { cache: "no-store" });
        if (!res.ok) throw new Error(`fires ${res.status}`);
        const buf = await res.arrayBuffer();
        if (!active) return;
        setFireCount(Math.floor(buf.byteLength / 8));
        worker.postMessage({ type: "fires", buf }, [buf]);
      } catch {
        /* best-effort: leave existing fires */
      }
    };

    loadQuakes();
    loadFires();
    const qId = setInterval(loadQuakes, QUAKE_REFRESH_MS);
    const fId = setInterval(loadFires, FIRE_REFRESH_MS);

    return () => {
      active = false;
      stop();
      clearInterval(qId);
      clearInterval(fId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      worker.terminate();
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

      <div className={hud} style={{ top: 14, left: 16 }}>
        <b className="font-medium text-op-muted">SIGINT</b>
        <br />
        USGS + NASA FIRMS
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
