import { externalLinks } from "@/constants/links";

/**
 * Curated featured-work data. Rendered as datasheet blocks independent of any
 * repo's visibility, so closed / private projects present fully.
 */

export type ProjectStatus =
  | "open-source"
  | "closed"
  | "in-development"
  | "live";

interface ProjectMeta {
  label: string;
  value: string;
}

interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
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

enum ProjectMetaLabel {
  Source = "Source",
  Type = "Type",
}

const privateProjectStatus: ProjectStatus = "closed";
const privateSource = "Private IP";

export const projects: Project[] = [
  {
    name: "Lucerna",
    status: "live",
    statusLabel: "live",
    hook: "A free Rosary companion with optional guidance, Scripture, and a collection of sacred art.",
    description:
      "I built Lucerna to help people learn the Rosary and make room for reflection as they pray. Optional guidance walks users through each mystery and can be turned off as the prayer becomes familiar. Scripture and sacred art accompany the prayer, with a collection users can explore by mystery, artist, or period. The TypeScript and React progressive web application (PWA) bundles that material for offline use. Preferences stay on the device, and there are no accounts, subscriptions, advertising, or tracking.",
    stack: [
      "TypeScript",
      "React 19",
      "Bun",
      "Vite",
      "Tailwind 4",
      "PWA",
      "Playwright",
      "GitHub Actions",
    ],
    meta: [{ label: ProjectMetaLabel.Type, value: "Offline-first PWA" }],
    links: [
      { label: "live app", href: "https://iitoneloc.github.io/lucerna/" },
      { label: "source", href: "https://github.com/iiTONELOC/lucerna" },
    ],
  },
  {
    name: "VUTM",
    status: privateProjectStatus,
    statusLabel: "private source · active",
    hook: "A shared security layer for virtual machines and containers on a Linux virtualization platform.",
    description:
      "VUTM is part of an Ubuntu platform I built to automate virtual-machine provisioning, hardening, and backups. It gives KVM and LXC networks shared encrypted DNS, threat filtering, and Suricata inspection. I designed the transition from detection to blocking around observed workload traffic and staged rule validation. Fail-closed handling protects inspected traffic during transitions and recovery. I operate the platform daily in intrusion detection mode; inline blocking remains pending.",
    stack: [
      "Ubuntu Server",
      "KVM / LXC",
      "nftables / UFW",
      "Suricata",
      "Unbound / dnsmasq",
      "ntopng",
      "WireGuard",
    ],
    meta: [
      { label: ProjectMetaLabel.Type, value: "Virtual workload security" },
      { label: ProjectMetaLabel.Source, value: privateSource },
    ],
    links: [],
  },
  {
    name: "Agentic Engineering Harness",
    status: privateProjectStatus,
    statusLabel: "private tooling · active",
    hook: "Development policy enforced at the boundary where coding agents use tools.",
    description:
      "I developed a shared Python harness to apply development policy to Claude Code and Codex. It checks commands and filesystem access before execution, uses ClamAV to scan introduced content for malware, and filters secrets from tool input and output. I added ownership checks to catch repeated definitions and change receipts to record what changed and which checks ran. These records support review of the work produced by an agent.",
    stack: ["Python 3.13", "Claude Code", "Codex", "ClamAV", "SonarQube"],
    meta: [
      { label: ProjectMetaLabel.Type, value: "Agent safety harness" },
      { label: ProjectMetaLabel.Source, value: privateSource },
    ],
    links: [],
  },
  {
    name: "TrashScanner",
    status: "live",
    statusLabel: "live · Defend I.T. Solutions",
    hook: "Scan products as they run out and keep a shopping list across devices, even offline.",
    description:
      "I developed and launched this progressive web application (PWA) for Defend I.T. Solutions. It supports phones, desktops, and USB-scanner kiosks. The React frontend stores list changes in IndexedDB so users can create lists, scan products, and edit items without a connection. Changes synchronize through a Bun and Hono API in order when connectivity returns. MariaDB operation records prevent retries from applying the same change twice. Verified sessions, Ed25519 device signatures, and database ownership checks protect access to each account's resources.",
    stack: [
      "TypeScript",
      "Bun",
      "Hono",
      "React",
      "MariaDB",
      "IndexedDB",
      "Ed25519",
      "PWA",
    ],
    meta: [{ label: ProjectMetaLabel.Type, value: "Offline shopping-list PWA" }],
    links: [
      { label: "live app", href: externalLinks.trashscanner },
      { label: "source", href: externalLinks.trashscannerSource },
    ],
  },
  {
    name: "SIGINT",
    status: "live",
    statusLabel: "live",
    hook: "A live globe that brings public event feeds together and connects related reports.",
    description:
      "I built SIGINT to make aircraft, vessel, natural hazard, weather, and news feeds easier to explore in one OSINT dashboard. Rendering a continuously changing globe required keeping that work separate from interface interaction. I designed a custom Canvas 2D engine that runs in Web Workers, leaving the main thread available to React. Source correlation connects overlapping reports and produces scored alerts. The installable application caches its interface and data for use when a connection is unavailable.",
    stack: [
      "TypeScript",
      "React 19",
      "Bun",
      "Canvas 2D",
      "Web Workers",
      "Docker",
      "Service Worker",
    ],
    meta: [{ label: ProjectMetaLabel.Type, value: "OSINT platform" }],
    links: [
      { label: "live demo", href: externalLinks.sigint },
      { label: "source", href: "https://github.com/iiTONELOC/sigint" },
    ],
  },
  {
    name: "O-Tether",
    status: privateProjectStatus,
    statusLabel: "private source · purpose-built",
    hook: "An RV network appliance that connects existing devices through a tethered phone with minimal administration.",
    description:
      "I engineered and deployed an ARM appliance that supplies an RV router with internet access through iPhone USB tethering. Devices keep their existing Wi-Fi configuration while the appliance handles connection setup and teardown. To support the older Linux kernel, I applied nftables changes as element-level updates in one transaction. I moved DNS blocklists to dnsmasq to fit the hardware's memory limits, while retaining Unbound for encrypted DNS. Suricata provides traffic inspection, and forwarding begins only after the protected network path is ready.",
    stack: [
      "ODROID C4",
      "Ubuntu Linux",
      "Bash",
      "nftables",
      "Suricata",
      "Unbound",
      "dnsmasq",
      "systemd",
    ],
    meta: [
      { label: ProjectMetaLabel.Type, value: "Travel security appliance" },
      { label: ProjectMetaLabel.Source, value: privateSource },
    ],
    links: [
      {
        label: "case study",
        href: externalLinks.oTetherCaseStudy,
      },
    ],
  },
];
