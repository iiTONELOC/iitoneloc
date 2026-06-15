"use client";

import { JSX, useEffect, useState } from "react";
import {
  type FeedStatus,
  getFeedStatus,
  subscribeFeedStatus,
} from "@/lib/feedStatus";

const styles = {
  bar: "border-b border-op-border bg-op-bg/60 font-mono text-[11.5px] text-op-dim",
  wrap: "mx-auto flex h-[34px] max-w-wrap items-center justify-between gap-5 overflow-hidden whitespace-nowrap px-5 sm:px-[30px]",
  left: "flex gap-6",
  feed: "inline-flex items-center gap-[6px]",
};

const feedColor: Record<FeedStatus, string> = {
  live: "var(--live)",
  offline: "var(--cyan)",
  sync: "var(--dim)",
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
  const [feed, setFeed] = useState<FeedStatus>(getFeedStatus());

  useEffect(() => {
    setClock(utcNow());
    const id = setInterval(() => setClock(utcNow()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setFeed(getFeedStatus());
    return subscribeFeedStatus(setFeed);
  }, []);

  const color = feedColor[feed];

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
