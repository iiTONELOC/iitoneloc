"use client";

import { JSX, useEffect, useRef, useState } from "react";
import {
  createGlobeController,
  supportsWorkerRender,
  type GlobeController,
} from "@/lib/globeController";
import { GLOBE_FRAME, GLOBE_HUD as hud } from "./frame";

// All rendering happens off the main thread in public/workers/globeWorker.js
// (it owns the transferred OffscreenCanvas), driven by src/lib/globeController.ts
// (worker lifecycle, render clock, feed polling). This component only mounts
// once, hands the controller its DOM nodes, and tears it down on unmount —
// React never re-renders while the globe is running.

const ACCENT_RGB = "255,180,84";
const FIRE_RGB = "255,107,61";
const HUD_PLACEHOLDER = "--";

export const Globe = (): JSX.Element => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const quakeCountRef = useRef<HTMLElement>(null);
  const fireCountRef = useRef<HTMLElement>(null);
  const statusTextRef = useRef<HTMLElement>(null);
  const statusDotRef = useRef<HTMLElement>(null);

  const [setupError, setSetupError] = useState<Error | null>(null);
  if (setupError) throw setupError;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const quakeCountEl = quakeCountRef.current;
    const fireCountEl = fireCountRef.current;
    const statusTextEl = statusTextRef.current;
    const statusDotEl = statusDotRef.current;
    if (
      !wrap ||
      !canvas ||
      !quakeCountEl ||
      !fireCountEl ||
      !statusTextEl ||
      !statusDotEl ||
      !supportsWorkerRender()
    ) {
      return;
    }

    let controller: GlobeController;
    try {
      controller = createGlobeController({
        wrap,
        canvas,
        hud: { quakeCountEl, fireCountEl, statusTextEl, statusDotEl },
      });
    } catch (error) {
      setSetupError(error instanceof Error ? error : new Error(String(error)));
      return;
    }

    controller.start();
    return () => controller.destroy();
  }, []);

  return (
    <div ref={wrapRef} className={GLOBE_FRAME}>
      <canvas ref={canvasRef} className="block h-full w-full" />

      <div className={hud} style={{ top: 14, left: 16 }}>
        <b className="font-medium text-op-muted">SIGINT</b>
        <br />
        USGS + NASA FIRMS
      </div>
      <div className={hud} style={{ top: 14, right: 16, textAlign: "right" }}>
        seismic{" "}
        <b ref={quakeCountRef} style={{ color: `rgb(${ACCENT_RGB})` }}>
          {HUD_PLACEHOLDER}
        </b>
        <br />
        fire{" "}
        <b ref={fireCountRef} style={{ color: `rgb(${FIRE_RGB})` }}>
          {HUD_PLACEHOLDER}
        </b>
      </div>
      <div className={hud} style={{ bottom: 14, left: 16 }}>
        proj: orthographic
      </div>
      <div className={hud} style={{ bottom: 14, right: 16, textAlign: "right" }}>
        <b ref={statusDotRef} style={{ color: "var(--dim)" }}>
          ●
        </b>{" "}
        <b ref={statusTextRef}>sync</b>
      </div>
    </div>
  );
};
