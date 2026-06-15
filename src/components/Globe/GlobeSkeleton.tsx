import { JSX } from "react";
import { GLOBE_FRAME, GLOBE_HUD } from "./frame";

/**
 * Loading / error placeholder for the globe. Same frame and HUD layout as the
 * live component so there is no layout shift, but a static wireframe and dashed
 * HUD readouts: clearly a placeholder, never fake live data.
 */
export const GlobeSkeleton = (): JSX.Element => {
  return (
    <div className={GLOBE_FRAME}>
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[78%] -translate-x-1/2 -translate-y-1/2 animate-pulse aspect-square"
        fill="none"
      >
        <g stroke="rgba(255,180,84,0.13)" strokeWidth="0.5">
          <circle cx="50" cy="50" r="40" stroke="rgba(255,180,84,0.22)" />
          <ellipse cx="50" cy="50" rx="40" ry="13.5" />
          <ellipse cx="50" cy="50" rx="40" ry="27" />
          <ellipse cx="50" cy="50" rx="13.5" ry="40" />
          <ellipse cx="50" cy="50" rx="27" ry="40" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </g>
      </svg>

      <div className={GLOBE_HUD} style={{ top: 14, left: 16 }}>
        <b className="font-medium text-op-muted">SIGINT</b>
        <br />
        USGS + NASA FIRMS
      </div>
      <div
        className={GLOBE_HUD}
        style={{ top: 14, right: 16, textAlign: "right" }}
      >
        seismic <b className="font-medium text-op-muted">--</b>
        <br />
        fire <b className="font-medium text-op-muted">--</b>
      </div>
      <div className={GLOBE_HUD} style={{ bottom: 14, left: 16 }}>
        proj: orthographic
      </div>
      <div
        className={GLOBE_HUD}
        style={{ bottom: 14, right: 16, textAlign: "right" }}
      >
        ● sync
      </div>
    </div>
  );
};
