import { externalLinks } from "@/constants/links";

type Link = {
  label: string;
  href: string;
};

type SkillGroup = {
  label: string;
  value: string;
};

type Experience = {
  organization: string;
  role: string;
  dates: string;
  location: string;
  bullets: readonly string[];
};

type Education = {
  institution: string;
  program: string;
  dates: string;
  honors: string | null;
};

type Project = {
  name: string;
  status: string;
  technologies: string;
  bullets: readonly string[];
  links: readonly Link[];
};

type Resume = {
  name: string;
  title: string;
  location: string;
  phone: Link;
  email: Link;
  availability: string;
  profiles: readonly Link[];
  summary: string;
  skills: readonly SkillGroup[];
  experience: readonly Experience[];
  education: readonly Education[];
  certification: string;
  projects: readonly Project[];
};

export const resume = {
  name: "Anthony Tropeano",
  title: "Security Engineer, Applied Cryptography & Secure Systems",
  location: "Ocala, FL",
  phone: { label: "352.709.3931", href: "tel:+13527093931" },
  email: {
    label: externalLinks.email,
    href: `mailto:${externalLinks.email}`,
  },
  availability: "Open to remote or relocation",
  profiles: [
    { label: "atropeano.com", href: "https://atropeano.com" },
    { label: "github.com/iiTONELOC", href: externalLinks.github },
    { label: "wedefendit.com", href: externalLinks.company },
    {
      label: "linkedin.com/in/anthony-t-29353b201",
      href: externalLinks.linkedin,
    },
  ],
  summary:
    "Security engineer focused on applied cryptography and secure systems who ships working software, operates infrastructure, and traces trust assumptions across application, network, and deployment boundaries to turn security requirements into maintainable code, deployed controls, and operational visibility.",
  skills: [
    {
      label: "Languages",
      value: "Rust, Python, TypeScript/JavaScript, C/C++, Bash, SQL",
    },
    {
      label: "Security Engineering",
      value:
        "Wazuh, Suricata, Zeek, network segmentation, Linux hardening, Burp Suite, NIST CSF, NIST SP 800-63B, OWASP ASVS, MITRE ATT&CK",
    },
    {
      label: "Cryptography and Identity",
      value:
        "ML-KEM, ML-DSA, Ed25519, AES-256-GCM-SIV, AES-256-GCM, ChaCha20-Poly1305, mTLS, OIDC/OAuth2, GPG code signing",
    },
    {
      label: "Infrastructure and DevSecOps",
      value:
        "Proxmox VE, OPNsense, Docker, Ansible, Caddy, WireGuard, Grafana, Prometheus, GitHub Actions",
    },
    {
      label: "Application Development",
      value:
        "React, Next.js, Bun, Hono, Node.js, PostgreSQL, MariaDB, REST/GraphQL",
    },
  ],
  experience: [
    {
      organization: "Defend I.T. Solutions",
      role: "Founder & Security Engineer",
      dates: "May 2025 - Present",
      location: "Ocala, FL",
      bullets: [
        "Built and now operate an Ansible-driven SOC/NOC across dual Proxmox nodes, deploying Wazuh SIEM to 12 agents, Suricata and Zeek network sensors, and Grafana/Prometheus monitoring.",
        "Automated Proxmox security-appliance deployment, reducing manual provisioning from more than two hours to 15-47 minutes.",
        "Deployed a two-tier OPNsense firewall topology with network segmentation, custom DDNS, Unbound DNS, Caddy reverse proxying, and automated internal CA certificate distribution.",
        "Completed the open-source DIS-Crypto MVP in Rust, unifying Rust, C, C++, Python, Node.js, and Bun behind a generated C ABI.",
        "Shipped O-Tether, a closed-source inline ARM security appliance; continue building TrashScanner toward OWASP ASVS Level 2 and NIST SP 800-63B AAL2 targets.",
      ],
    },
    {
      organization: "University of Arizona",
      role: "Python Course Assistant",
      dates: "Dec 2024 - Dec 2025",
      location: "Remote",
      bullets: [
        "Mentored cybersecurity undergraduates in Python programming, debugging methodology, and development-environment configuration.",
        "Identified recurring programming and environment failures, then authored targeted reference material to support student completion.",
      ],
    },
  ],
  education: [
    {
      institution: "Nova Southeastern University",
      program: "M.S., Artificial Intelligence (Data Science Concentration)",
      dates: "Fall 2026 | Expected 2028",
      honors: null,
    },
    {
      institution: "University of Arizona",
      program: "B.A.S., Cyber Operations (Cyber Engineering Emphasis)",
      dates: "December 2025",
      honors:
        "Summa Cum Laude | GPA 4.0 | NSA CAE-CO Designated Program | Outstanding Senior Award Nominee | Distinguished Undergraduate Scholar | Dean's List with Distinction",
    },
  ],
  certification:
    "NSA Cyber Operations Program Certificate, University of Arizona (December 2025)",
  projects: [
    {
      name: "DIS-Crypto",
      status: "Open source, MVP complete",
      technologies: "Rust",
      bullets: [
        "Built the library in Rust behind one generated C ABI serving Rust, C, C++, Python, Node.js, and Bun.",
        "Designed security-level-based selection; core asymmetric trust operations combine classical and post-quantum algorithms, while encryption modes are authenticated and key-committing.",
      ],
      links: [
        {
          label: "Source",
          href: "https://github.com/wedefendit/dis-crypto",
        },
      ],
    },
    {
      name: "TrashScanner",
      status: "In development",
      technologies: "TypeScript, Bun, Hono, React, MariaDB, Zitadel OIDC",
      bullets: [
        "Targets OWASP ASVS Level 2 and NIST SP 800-63B AAL2 with six per-request gates: identity, freshness, device, possession, entitlement, and ownership.",
        "Implements single-use Ed25519 JWT rotation, dual-path mTLS/Web Crypto device authentication, signed code-manifest boot verification, and least-privilege database roles.",
      ],
      links: [],
    },
    {
      name: "O-Tether",
      status: "Shipped, closed source",
      technologies: "ARM security appliance",
      bullets: [
        "Built an inline appliance for low-cost ARM hardware with a phone-tether bridge, default-deny firewall, threat-intelligence filtering, flow classification, inline intrusion prevention, signed releases, and fail-closed behavior.",
      ],
      links: [
        {
          label: "Case study",
          href: "https://wedefendit.com/services/custom-solutions/o-tether",
        },
      ],
    },
    {
      name: "SIGINT",
      status: "Live",
      technologies: "TypeScript, React, Bun, Canvas 2D, Web Workers",
      bullets: [
        "Built an OSINT dashboard combining eight data sources on an interactive globe with a custom Canvas 2D and Web Worker rendering engine.",
        "Implemented cross-source correlation, scored alerts, watch-mode notifications, PWA functionality, and offline capabilities.",
      ],
      links: [
        { label: "Source", href: "https://github.com/iiTONELOC/sigint" },
        {
          label: "Live demo",
          href: "https://sigint-5154d935429b.herokuapp.com",
        },
      ],
    },
    {
      name: "0xDL and pveauto",
      status: "Published Rust projects",
      technologies: "Rust",
      bullets: [
        "Published 0xDL for asynchronous downloads with cryptographic integrity validation and pveauto for automated Proxmox VE ISO download and verification.",
      ],
      links: [
        {
          label: "crates.io",
          href: "https://crates.io/users/iiTONELOC",
        },
      ],
    },
    {
      name: "threads-kernel",
      status: "CYBV 489 coursework",
      technologies: "C",
      bullets: [
        "Implemented scheduling, synchronization, IPC, interrupt handling, system calls, and basic disk I/O within the academic THREADS teaching framework.",
        "Co-authored Escamilla et al., “Investigating Covert IPC in THREADS,” Cyber Recon '25, contributing the round-robin scheduler and core OS primitives.",
      ],
      links: [
        {
          label: "Source",
          href: "https://github.com/iiTONELOC/threads-kernel",
        },
      ],
    },
  ],
} as const satisfies Resume;
