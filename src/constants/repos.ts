/**
 * Curated repositories for the `// from github` strip, in display order.
 *
 * Baked as static data on purpose: the strip is a fixed, hand-picked set, so a
 * live per-repo GitHub pull added latency and a failure mode (a repo silently
 * dropping when its README/contents fetch hiccuped) with no real upside. These
 * render instantly and reliably.
 *
 * `updated` is the repo's last-updated timestamp at curation time; refresh it
 * if a repo sees meaningful new work.
 */
export interface GithubRepo {
  name: string;
  description: string;
  language: string;
  url: string;
  updated: string;
}

export const githubStripRepos: GithubRepo[] = [
  {
    name: "safe-pc",
    description:
      "Repurposes older x86-64 PCs as security appliances for small networks. Python automation verifies installation media and drives unattended Proxmox and OPNsense setup.",
    language: "Python",
    url: "https://github.com/iiTONELOC/safe-pc",
    updated: "2025-11-26",
  },
  {
    name: "pveauto",
    description:
      "Rust library and command-line tool that downloads Proxmox VE ISO images and verifies their integrity.",
    language: "Rust",
    url: "https://github.com/iiTONELOC/pveauto",
    updated: "2025-12-27",
  },
  {
    name: "threads-kernel",
    description:
      "Adds core operating system functions to the THREADS teaching framework. Written in C, the project covers scheduling, synchronization, message passing, interrupts, and system calls.",
    language: "C",
    url: "https://github.com/iiTONELOC/threads-kernel",
    updated: "2026-01-23",
  },
  {
    name: "turing-machines",
    description:
      "Dependency-free JavaScript library and CLI for defining and running single-tape Turing machines.",
    language: "JavaScript",
    url: "https://github.com/iiTONELOC/turing-machines",
    updated: "2024-05-28",
  },
];
