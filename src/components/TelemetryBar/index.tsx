"use client";

import { JSX, useEffect, useState, useSyncExternalStore } from "react";
import {
  INITIAL_FEED_STATUS,
  feedStatusColor,
  getFeedStatus,
  subscribeFeedStatus,
} from "@/lib/feedStatus";

const styles = {
  bar: "border-b border-op-border bg-op-bg/60 font-mono text-[11.5px] text-op-dim print:hidden",
  wrap: "mx-auto flex h-[34px] max-w-wrap items-center justify-between gap-5 overflow-hidden whitespace-nowrap px-5 sm:px-[30px]",
  left: "flex gap-6",
  feed: "inline-flex items-center gap-[6px]",
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
  const feed = useSyncExternalStore(
    subscribeFeedStatus,
    getFeedStatus,
    () => INITIAL_FEED_STATUS
  );

  useEffect(() => {
    const tick = () => setClock(utcNow());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const color = feedStatusColor[feed];

  return (
    <div className={styles.bar}>
      <div className={styles.wrap}>
        <div className={styles.left}>
          <span className={styles.feed} style={{ color }}>
            <span
              className={feed === "live" ? "blink" : undefined}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
            feeds: {feed}
          </span>
          <span className="hidden sm:inline">
            node: ocala-fl &middot; 29.18&deg;n 82.14&deg;w
          </span>
          <span suppressHydrationWarning>{clock}</span>
        </div>
        <div className="hidden sm:block">uplink: secure</div>
      </div>
    </div>
  );
};
