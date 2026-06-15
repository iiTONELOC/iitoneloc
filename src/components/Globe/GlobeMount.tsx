"use client";

import { JSX } from "react";
import dynamic from "next/dynamic";
import { GlobeSkeleton } from "./GlobeSkeleton";
import { GlobeErrorBoundary } from "./GlobeErrorBoundary";

// Client-only (ssr: false): the canvas has no server render. Suspense-backed
// loading fallback shows the skeleton until the chunk loads and mounts.
const Globe = dynamic(() => import("./index").then((m) => m.Globe), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

/**
 * Public globe entry: dynamic, client-only, with a skeleton loading fallback
 * and an error boundary that degrades to the same skeleton.
 */
export const GlobeMount = (): JSX.Element => {
  return (
    <GlobeErrorBoundary fallback={<GlobeSkeleton />}>
      <Globe />
    </GlobeErrorBoundary>
  );
};
