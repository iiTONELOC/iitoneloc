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
    designation: "01 / dis-crypto",
    name: "DIS-Crypto",
    status: "open-source",
    statusLabel: "open source · MVP complete",
    hook: "Authenticated classical + post-quantum cryptography with a small API that makes unsafe combinations unreachable.",
    description:
      "Built in Rust behind a single generated C ABI, with bindings for C, C++, Python, Node.js, and Bun. Callers choose a security level, not algorithms or parameters. Core asymmetric trust operations combine classical and post-quantum algorithms, while every encryption mode is authenticated and key-committing. Optional identity, signed-manifest, JWT, and private mTLS modules extend the everyday API.",
    stack: ["Rust", "C", "C++", "Python", "Node.js", "Bun"],
    meta: [
      { label: "KEM", value: "P-256 + ML-KEM (hybrid)" },
      { label: "Signatures", value: "Ed25519 + ML-DSA / SLH-DSA (hybrid)" },
      {
        label: "AEAD",
        value: "AES-256-GCM-SIV / AES-256-GCM / ChaCha20-Poly1305",
      },
    ],
    links: [
      { label: "source", href: "https://github.com/wedefendit/dis-crypto" },
    ],
  },
  {
    designation: "02 / sigint",
    name: "SIGINT",
    status: "live",
    statusLabel: "live",
    hook: "Real-time OSINT intelligence dashboard on an interactive globe.",
    description:
      "Combines eight live data sources: aircraft, vessels, seismic activity, fires, weather, cyclones, GDELT events, and news. A custom Canvas 2D and Web Worker engine renders the globe off the main thread. Cross-source correlation produces scored alerts and watch-mode notifications, with PWA and offline support.",
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
      "Runs on a low-cost ARM single-board computer and provides an automatic phone-tether bridge, a default-deny firewall, threat-intelligence filtering, flow classification, and inline intrusion prevention. Releases are signed, and the appliance fails closed.",
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
      "Every request clears six independent gates before data access: identity, freshness, device, possession, entitlement, and ownership. A signed code manifest is verified at boot with no override. Per-service Ed25519 audit chains, single-use refresh rotation, dual-path device authentication, and least-privilege database roles provide defense in depth.",
    stack: ["TypeScript", "Bun", "Hono", "React", "Zitadel"],
    meta: [
      {
        label: "Target",
        value: "OWASP ASVS L2 · NIST SP 800-63B AAL2",
      },
    ],
    links: [],
  },
];
