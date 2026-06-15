/**
 * Shared outer-frame classes for the globe and its skeleton, so the loading
 * placeholder and the live canvas occupy the exact same box (no layout shift).
 */
export const GLOBE_FRAME =
  "relative order-[-1] h-[340px] overflow-hidden rounded-[12px] border border-op-border bg-op-surface bg-[radial-gradient(circle_at_50%_45%,rgba(255,180,84,0.04),transparent_60%)] md:order-none md:h-[440px]";

export const GLOBE_HUD =
  "pointer-events-none absolute font-mono text-[10.5px] text-op-dim";
