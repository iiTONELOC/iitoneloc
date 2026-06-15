/**
 * Tiny shared feed-status store so the telemetry bar can reflect the globe's
 * real feed state instead of a hardcoded "feeds: live". The globe publishes its
 * USGS fetch result; the telemetry bar subscribes. No dependency, no fake state.
 */
export type FeedStatus = "sync" | "live" | "offline";

let current: FeedStatus = "sync";
const listeners = new Set<(s: FeedStatus) => void>();

export function setFeedStatus(s: FeedStatus): void {
  if (s === current) return;
  current = s;
  listeners.forEach((l) => l(s));
}

export function getFeedStatus(): FeedStatus {
  return current;
}

export function subscribeFeedStatus(l: (s: FeedStatus) => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
