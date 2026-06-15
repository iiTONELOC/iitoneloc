/**
 * Curated featured-work data. Rendered as datasheet blocks independent of any
 * repo's visibility, so closed / private projects present fully.
 */

export type ProjectStatus =
  | "open-source"
  | "closed"
  | "in-development"
  | "live"
  | "published";

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
    designation: "01 / dis-crypto",
    name: "DIS-Crypto",
    status: "open-source",
    statusLabel: "open source · early dev",
    hook: "Post-quantum + classical cryptography you can't get wrong. Built for developers, not cryptographers.",
    description:
      "Forged in Rust. Pick a security level, not parameters. The API can't express an unsafe combination. Every exchange and signature is a classical + post-quantum hybrid; every encryption is authenticated and key-committing. An optional identity layer adds self-rooted certs, a trust store, revocation, a tamper-evident audit chain, and signed release manifests.",
    stack: ["Rust", "Python", "Node/Bun", "C++"],
    meta: [
      { label: "KEM", value: "P-256 + ML-KEM (hybrid)" },
      { label: "Signatures", value: "Ed25519 + ML-DSA / SLH-DSA (hybrid)" },
      {
        label: "AEAD",
        value: "AES-256-GCM-SIV / AES-256-GCM / ChaCha20-Poly1305",
      },
    ],
    links: [
      // { label: "source", href: "https://github.com/wedefendit/dis-crypto" },
    ],
  },
  {
    designation: "02 / sigint",
    name: "SIGINT",
    status: "live",
    statusLabel: "live",
    hook: "Real-time OSINT intelligence dashboard on an interactive globe.",
    description:
      "Incorporates eight live data sources (aircraft, vessels, seismic, fires, weather, cyclones, GDELT events, news). Rendered with a custom Canvas 2D + Web Worker engine, SIGINT uses a cross-source correlation engine to produce scored alerts and watch-mode notifications. PWA with offline support.",
    stack: ["TypeScript", "React 19", "Bun", "Canvas 2D", "Web Workers"],
    meta: [{ label: "Type", value: "OSINT platform" }],
    links: [
      { label: "live demo", href: "https://sigint-5154d935429b.herokuapp.com" },
      { label: "source", href: "https://github.com/iiTONELOC/sigint" },
    ],
  },
  {
    designation: "03 / o-tether",
    name: "O-Tether",
    status: "closed",
    statusLabel: "closed source · shipped",
    hook: "A five-layer inline UTM appliance that turns any router into a secure travel network.",
    description:
      "Runs on low-cost ARM single-board computer. Features automatic phone-tether bridge, default-deny firewall, threat-intelligence filtering, flow classification, and inline intrusion prevention. Ships signed releases and is fail-closed.",
    stack: ["ARM", "UTM", "IPS", "signed releases"],
    meta: [{ label: "Type", value: "Security appliance" }],
    links: [
      {
        label: "case study",
        href: "https://wedefendit.com/services/custom-solutions/o-tether",
      },
    ],
  },
  {
    designation: "04 / trashscanner",
    name: "TrashScanner",
    status: "in-development",
    statusLabel: "in development",
    hook: "Scan it before you can it™. A zero-trust SaaS reference implementation.",
    description:
      "Every request clears six independent gates: identity, freshness, device, possession, entitlement, ownership; before any data is touched. Signed code manifest verified at boot: hard-fail, no override. Per-service, append-only Ed25519 audit hash chains, trigger-enforced at the database. Ed25519 JWTs with single-use refresh rotation and family-based replay detection; dual-path device auth (mTLS + Web Crypto challenge-response). Least-privilege DB roles with column-scoped grants, isolating billing writes and GDPR erasure behind locked DEFINER procedures.",
    stack: ["TypeScript", "Bun", "Hono", "React", "Zitadel"],
    meta: [
      { label: "Target", value: "OWASP ASVS L2 · AAL2" },
      { label: "Blocked on", value: "DIS-Crypto" },
    ],
    links: [],
  },
];
