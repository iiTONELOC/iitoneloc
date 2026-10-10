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
    name: "SIGINT",
    status: "live",
    statusLabel: "live",
    hook: "A live globe that brings public event feeds together and connects related reports.",
    description:
      "SIGINT brings public event feeds into one live view. Aircraft, ships, natural hazards, weather, and news appear on the globe, and when several feeds report the same event, SIGINT links them into a scored alert. A custom Canvas 2D engine runs in Web Workers, keeping the interface responsive while thousands of tracks move. The hurricane center pairs each storm's forecast with radar and satellite loops, and selecting an earthquake plays the recorded ground motion from the nearest seismic station. It installs as an app and works offline.",
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
      { label: "demo video", href: externalLinks.sigintDemo },
      { label: "source", href: "https://github.com/iiTONELOC/sigint" },
    ],
  },
  {
    name: "Lucerna",
    status: "live",
    statusLabel: "live",
    hook: "A free Rosary companion with optional guidance, Scripture, and a collection of sacred art.",
    description:
      "Lucerna helps people learn the Rosary and make room for reflection as they pray. Optional guidance walks users through each mystery and can be turned off as the prayer becomes familiar. Scripture and sacred art accompany the prayer, with a collection users can explore by mystery, artist, or period. The TypeScript and React progressive web application (PWA) bundles that material for offline use. Preferences stay on the device, and there are no accounts, subscriptions, advertising, or tracking.",
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
      { label: "live app", href: "https://praylucerna.com" },
      { label: "source", href: "https://github.com/iiTONELOC/lucerna" },
    ],
  },
  {
    name: "SAFE-PC",
    status: "open-source",
    statusLabel: "operational since Nov 2025",
    hook: "Repurposing older PCs for affordable home and small-office network security.",
    description:
      "SAFE-PC, a university capstone project, asks whether PCs headed for disposal can provide affordable network security for homes and small offices. It automates setup with Proxmox and OPNsense: Python checks installation media against SHA-256 hashes and runs the firewall installer unattended through a serial console. The firewall starts with Suricata intrusion prevention, outbound connections restricted to approved ports, and DNS over TLS.",
    stack: ["Python", "Proxmox VE", "OPNsense", "Suricata", "ZFS"],
    meta: [
      { label: ProjectMetaLabel.Type, value: "Security appliance framework" },
    ],
    links: [
      { label: "source", href: externalLinks.safePcSource },
      { label: "ISO builder demo", href: externalLinks.safePcIsoDemo },
      { label: "VM install demo", href: externalLinks.safePcInstallDemo },
    ],
  },
  {
    name: "VUTM",
    status: privateProjectStatus,
    statusLabel: "private source · active",
    hook: "A shared security layer for virtual machines and containers on a Linux virtualization platform.",
    description:
      "VUTM is part of an Ubuntu platform that automates virtual-machine provisioning, hardening, and backups. It gives KVM and LXC networks shared encrypted DNS, threat filtering, and Suricata inspection. The transition from detection to blocking is built around observed workload traffic and staged rule validation. Fail-closed handling protects inspected traffic during transitions and recovery. The platform runs daily in intrusion detection mode; inline blocking remains pending.",
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
    name: "DIS-VPS",
    status: "in-development",
    statusLabel: "private source · in development",
    hook: "A self-hosted platform that runs isolated applications on one Linux VPS without containers.",
    description:
      "DIS-VPS is a Heroku replacement built on native Ansible and systemd, with the operating system itself as the isolation boundary: each app runs as its own user from a read-only image, in its own network namespace, confined by seccomp and AppArmor, and able to reach only the hostnames it declares. The network protections are ported from VUTM, blocking unapproved connections across the server and inspecting web traffic before it reaches an app. Releases are blue-green, and a failed release leaves the previous one serving.",
    stack: [
      "Ansible",
      "systemd",
      "nftables",
      "Suricata",
      "ModSecurity",
      "AppArmor",
      "squashfs",
      "WireGuard",
    ],
    meta: [
      { label: ProjectMetaLabel.Type, value: "Self-hosted application platform" },
      { label: ProjectMetaLabel.Source, value: privateSource },
    ],
    links: [],
  },
  {
    name: "O-Tether",
    status: privateProjectStatus,
    statusLabel: "private source · purpose-built",
    hook: "An RV network appliance that connects existing devices through a tethered phone with minimal administration.",
    description:
      "O-Tether is a deployed ARM appliance that supplies an RV router with internet access through iPhone USB tethering. Devices keep their existing Wi-Fi configuration while the appliance handles connection setup and teardown. To support the older Linux kernel, nftables changes are applied as element-level updates in one transaction. DNS blocklists run on dnsmasq to fit the hardware's memory limits, with Unbound retained for encrypted DNS. Suricata provides traffic inspection, and forwarding begins only after the protected network path is ready.",
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
  {
    name: "TrashScanner",
    status: "live",
    statusLabel: "live · Defend I.T. Solutions",
    hook: "Scan products as they run out and keep a shopping list across devices, even offline.",
    description:
      "TrashScanner began as a tool for a family member who needed a dependable way to remember what to buy. Scanning an item as it runs out adds it to a shopping list shared across phones, desktops, and a USB-scanner kiosk. Lists remain usable offline and sync in order when the connection returns, so a retried change is never applied twice. Sign-in uses passkeys, and the server requires the device to verify the person signing in; each device then signs its requests, and every query confirms the account owns what it touches.",
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
    name: "Agentic Engineering Harness",
    status: privateProjectStatus,
    statusLabel: "private tooling · active",
    hook: "Guardrails that stop coding agents before they do damage, and receipts that prove what they did.",
    description:
      "Coding agents delete the wrong file, write outside the repository, duplicate code that already exists, and report success without evidence. This harness intercepts every tool call before it runs: it refuses irreversible commands and paths outside the workspace, scans new content for malware, and keeps secrets out of what the agent reads and writes. An ownership index flags any definition the repository already has, so duplicates are caught rather than merged. Each change closes with a receipt of what changed and which checks ran, so review rests on evidence rather than the agent's account. One policy governs Claude Code and Codex.",
    stack: ["Python 3.13", "Claude Code", "Codex", "ClamAV", "SonarQube"],
    meta: [
      { label: ProjectMetaLabel.Type, value: "Agent safety harness" },
      { label: ProjectMetaLabel.Source, value: privateSource },
    ],
    links: [],
  },
];
