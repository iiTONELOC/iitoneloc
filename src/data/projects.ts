/**
 * Curated featured-work data. Rendered as datasheet blocks independent of any
 * repo's visibility, so closed / private projects present fully.
 */

export type ProjectStatus =
  | "open-source"
  | "closed"
  | "in-development"
  | "live";

export interface ProjectMeta {
  label: string;
  value: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  designation: string;
  name: string;
  status: ProjectStatus;
  /** Display text for the status pill (defaults handled by the renderer). */
  statusLabel: string;
  hook: string;
  description: string;
  stack: string[];
  meta: ProjectMeta[];
  links: ProjectLink[];
}

export const projects: Project[] = [
  {
    designation: "01 / sigint",
    name: "SIGINT",
    status: "live",
    statusLabel: "live",
    hook: "Real-time OSINT dashboard built around an interactive globe.",
    description:
      "SIGINT combines eight live feeds for aircraft, vessels, earthquakes, fires, weather, cyclones, GDELT events, and news. A custom Canvas 2D engine uses Web Workers to keep rendering off the main thread. Cross-source correlation produces scored alerts and watch notifications. The dashboard also works as a PWA and supports offline use.",
    stack: ["TypeScript", "React 19", "Bun", "Canvas 2D", "Web Workers"],
    meta: [{ label: "Type", value: "OSINT platform" }],
    links: [
      { label: "live demo", href: "https://sigint-5154d935429b.herokuapp.com" },
      { label: "source", href: "https://github.com/iiTONELOC/sigint" },
    ],
  },
  {
    designation: "02 / o-tether",
    name: "O-Tether",
    status: "closed",
    statusLabel: "closed source · shipped",
    hook: "Five-layer inline security appliance for secure travel networks.",
    description:
      "O-Tether runs on low-cost ARM hardware and creates an automatic phone-tether bridge. Its security layers include a default-deny firewall, threat filtering, flow classification, and inline intrusion prevention. Signed releases protect software integrity. The appliance fails closed during faults.",
    stack: ["ARM", "UTM", "IPS", "signed releases"],
    meta: [{ label: "Type", value: "Security appliance" }],
    links: [
      {
        label: "case study",
        href: "https://wedefendit.com/services/custom-solutions/o-tether",
      },
    ],
  },
];
