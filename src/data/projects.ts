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
    hook: "Authenticated, post-quantum-safe cryptography with a correct-by-construction API, for developers who are not cryptographers.",
    description:
      "Composes vetted, audited primitives into a small, opinionated API where the caller picks a security posture and level, not individual parameters; it rolls no cryptography of its own. Every asymmetric operation is a classical and post-quantum hybrid, and every encryption is authenticated and key-committing, holding a 128-bit floor after quantum effects. There is no unauthenticated mode, no anonymous-sender mode, and no insecure-default escape hatch: the unsafe choice is not reachable through the API. An optional identity layer adds self-rooted certificates, a trust store, a revocation list, and an audit chain.",
    stack: ["Rust", "Python", "Node/Bun", "C++"],
    meta: [
      { label: "KEM", value: "P-256 + ML-KEM (hybrid)" },
      { label: "Signatures", value: "Ed25519 + ML-DSA / SLH-DSA (hybrid)" },
      {
        label: "AEAD",
        value: "AES-256-GCM-SIV / AES-256-GCM / ChaCha20-Poly1305",
      },
    ],
    links: [{ label: "source", href: "https://github.com/wedefendit/dis-crypto" }],
  },
  {
    designation: "02 / sigint",
    name: "SIGINT",
    status: "live",
    statusLabel: "live",
    hook: "Real-time OSINT intelligence dashboard on an interactive globe.",
    description:
      "Eight live data sources (aircraft, vessels, seismic, fires, weather, cyclones, GDELT events, news) rendered with a custom Canvas 2D + Web Worker engine. Cross-source correlation engine produces scored alerts and watch-mode notifications; PWA with offline support.",
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
      "Runs on low-cost ARM single-board hardware: automatic phone-tether bridge, default-deny firewall, threat-intelligence filtering, flow classification, and inline intrusion prevention. Ships signed releases and is fail-closed. If protection can't be enforced, the connection drops with it.",
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
    hook: "A zero-trust SaaS reference implementation.",
    description:
      "Six-gate per-request verification (identity, freshness, device, possession, entitlement, ownership); Ed25519 JWT with single-use jti rotation; dual-path device auth (mTLS + Web Crypto challenge-response); GPG-signed code manifest verified at boot; least-privilege DB roles isolating billing writes.",
    stack: ["TypeScript", "Bun", "Hono", "React", "Zitadel"],
    meta: [
      { label: "Target", value: "OWASP ASVS L2 · AAL2" },
      { label: "Blocked on", value: "DIS-Crypto" },
    ],
    links: [],
  },
];
