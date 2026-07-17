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
      "Turns end-of-life x86_64 PCs into unattended SOHO security appliances using Proxmox, OPNsense, Suricata, and Python orchestration.",
    language: "Python",
    url: "https://github.com/iiTONELOC/safe-pc",
    updated: "2025-11-26",
  },
  {
    name: "pveauto",
    description:
      "Rust library and CLI that downloads Proxmox VE ISO images and verifies their cryptographic integrity.",
    language: "Rust",
    url: "https://github.com/iiTONELOC/pveauto",
    updated: "2025-12-27",
  },
  {
    name: "threads-kernel",
    description:
      "C implementations of core operating-system primitives in the THREADS teaching framework: scheduling, semaphores, mutexes, message passing, interrupt handling, and basic system calls.",
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
