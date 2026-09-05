export type FeedStatus = "sync" | "live" | "offline";

export const INITIAL_FEED_STATUS: FeedStatus = "sync";

export const feedStatusColor: Record<FeedStatus, string> = {
  live: "var(--live)",
  offline: "var(--cyan)",
  sync: "var(--dim)",
};

let current: FeedStatus = INITIAL_FEED_STATUS;
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
