/**
 * Curated repositories for the `// from github` strip, in display order.
 *
 * Baked as static data on purpose: the strip is a fixed, hand-picked set, so a
 * live per-repo GitHub pull added latency and a failure mode (a repo silently
 * dropping when its README/contents fetch hiccuped) with no real upside. These
 * render instantly and reliably. The GitHub API layer still exists in
 * src/server-utils if a live pull is ever wanted again.
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
      "SAFE-PC is an automated framework that converts end-of-life x86_64 PCs into sustainable, fully unattended SOHO security appliances using Proxmox, OPNsense, Suricata, and Python-driven orchestration.",
    language: "Python",
    url: "https://github.com/iiTONELOC/safe-pc",
    updated: "2025-11-26",
  },
  {
    name: "pveauto",
    description:
      "Rust-based library and command-line tool designed to download and verify Proxmox Virtual Environment ISO images automatically.",
    language: "Rust",
    url: "https://github.com/iiTONELOC/pveauto",
    updated: "2025-12-27",
  },
  {
    name: "threads-kernel",
    description:
      "Core operating-system components in C within the THREADS teaching framework: thread scheduling, semaphores, mutual exclusion, message passing, interrupt handling, and basic system-call logic (CYBV 489).",
    language: "C",
    url: "https://github.com/iiTONELOC/threads-kernel",
    updated: "2026-01-23",
  },
  {
    name: "turing-machines",
    description:
      "Dependency-free utility for creating and running single-tape Turing machines, usable as a library or from the command line.",
    language: "JavaScript",
    url: "https://github.com/iiTONELOC/turing-machines",
    updated: "2024-05-28",
  },
];
