"use client";

import { JSX, useEffect, useRef } from "react";
import {
  createGlobeController,
  supportsWorkerRender,
} from "@/lib/globeController";
import { GLOBE_FRAME, GLOBE_HUD as hud } from "./frame";

// React mounts the controller and provides its HUD nodes.
// The worker owns the transferred canvas and render loop.

const HUD_PLACEHOLDER = "--";

export const Globe = (): JSX.Element => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const quakeCountRef = useRef<HTMLElement>(null);
  const fireCountRef = useRef<HTMLElement>(null);
  const statusTextRef = useRef<HTMLElement>(null);
  const statusDotRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const quakeCountEl = quakeCountRef.current;
    const fireCountEl = fireCountRef.current;
    const statusTextEl = statusTextRef.current;
    const statusDotEl = statusDotRef.current;
    if (
      !wrap ||
      !quakeCountEl ||
      !fireCountEl ||
      !statusTextEl ||
      !statusDotEl ||
      !supportsWorkerRender()
    ) {
      return;
    }

    const controller = createGlobeController({
      wrap,
      hud: { quakeCountEl, fireCountEl, statusTextEl, statusDotEl },
    });

    controller.start();
    return () => controller.destroy();
  }, []);

  return (
    <div ref={wrapRef} className={GLOBE_FRAME}>
      <div className={hud} style={{ top: 14, left: 16 }}>
        <b className="font-medium text-op-muted">SIGINT</b>
        <br />
        USGS + NASA FIRMS
      </div>
      <div className={hud} style={{ top: 14, right: 16, textAlign: "right" }}>
        seismic{" "}
        <b ref={quakeCountRef} style={{ color: "var(--accent)" }}>
          {HUD_PLACEHOLDER}
        </b>
        <br />
        fire{" "}
        <b ref={fireCountRef} style={{ color: "var(--fire)" }}>
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
