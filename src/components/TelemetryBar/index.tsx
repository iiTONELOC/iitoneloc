"use client";

import { JSX, useEffect, useState } from "react";

const styles = {
  bar: "border-b border-op-border bg-op-bg/60 font-mono text-[11.5px] text-op-dim",
  wrap: "mx-auto flex h-[34px] max-w-wrap items-center justify-between gap-5 overflow-hidden whitespace-nowrap px-[30px]",
  left: "flex gap-6",
  live: "op-blink inline-flex items-center gap-[6px] text-op-live before:h-[6px] before:w-[6px] before:rounded-full before:bg-op-live before:shadow-[0_0_8px_var(--live)]",
};

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function utcNow(): string {
  const d = new Date();
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(
    d.getUTCSeconds()
  )} utc`;
}

/**
 * Top telemetry strip. The clock is a real UTC readout updated every second.
 * Renders a stable placeholder on the server to avoid hydration mismatch.
 */
export const TelemetryBar = (): JSX.Element => {
  const [clock, setClock] = useState<string>("--:--:-- utc");

  useEffect(() => {
    setClock(utcNow());
    const id = setInterval(() => setClock(utcNow()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.bar}>
      <div className={styles.wrap}>
        <div className={styles.left}>
          <span className={styles.live}>feeds: live</span>
          <span>node: ocala-fl &middot; 29.18&deg;n 82.14&deg;w</span>
          <span suppressHydrationWarning>{clock}</span>
        </div>
        <div>uplink: secure</div>
      </div>
    </div>
  );
};
