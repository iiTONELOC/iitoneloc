import { externalLinks } from "../constants/links";

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
  certifications: readonly string[];
  projects: readonly Project[];
};

export const resume = {
  name: "Anthony Tropeano",
  title: "Security Engineer | Secure Systems and Infrastructure",
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
    "Security engineer with experience in infrastructure automation, network defense, systems programming, and full-stack development.",
  skills: [
    {
      label: "Languages",
      value: "Rust, Python, TypeScript/JavaScript, C/C++, Bash, SQL",
    },
    {
      label: "Security Engineering",
      value:
        "Wazuh, Suricata, Zeek, network segmentation, Linux hardening, Burp Suite, GPG code signing, NIST CSF, NIST SP 800-63B, OWASP ASVS, MITRE ATT&CK",
    },
    {
      label: "Infrastructure / DevSecOps",
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
        "Built an Ansible-managed SOC/NOC on two Proxmox nodes: Wazuh (12 agents), Suricata, Zeek, Grafana, Prometheus.",
        "Automated Proxmox appliance deployment, cutting setup time from 2+ hours to 15 minutes.",
        "Deployed a two-tier OPNsense firewall with network segmentation, DDNS, Unbound DNS, Caddy, and automated CA distribution.",
        "Shipped O-Tether, a closed-source inline security appliance for ARM hardware.",
      ],
    },
    {
      organization: "University of Arizona",
      role: "Python Course Assistant",
      dates: "Nov 2024 - Dec 2025",
      location: "Remote",
      bullets: [
        "Mentored cybersecurity students in Python, debugging, and dev environment setup.",
        "Wrote guides for recurring code and environment issues.",
      ],
    },
    {
      organization: "Self-Employed",
      role: "Freelance Full-Stack Developer",
      dates: "Mar 2025 - Apr 2025",
      location: "Remote",
      bullets: [
        "Rebuilt a legacy Wix site in Next.js/TypeScript/Tailwind, improving performance and SEO.",
        "Cut hosting costs to zero via Vercel deployment.",
      ],
    },
    {
      organization: "edX/2U",
      role: "Full-Stack Web Development Grader",
      dates: "Aug 2021 - Nov 2023",
      location: "Remote",
      bullets: [
        "Graded student MERN apps on code quality, architecture, and best practices.",
        "Verified assignment integrity and enforced grading standards through curriculum changes.",
      ],
    },
    {
      organization: "Eco-Surfacing Foils",
      role: "Project Manager",
      dates: "May 2017 - Dec 2020",
      location: "Ocala, FL",
      bullets: [
        "Managed scheduling, client communication, and cost control for $1M-$1.5M in annual projects.",
        "Replaced paper workflows with GPS-based scheduling.",
        "Redesigned the company logo and website.",
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
  certifications: [
    "NSA Cyber Operations Program Certificate, University of Arizona (December 2025)",
    "Full-Stack Web Development Certificate, University of Central Florida (August 2021)",
  ],
  projects: [
    {
      name: "SIGINT",
      status: "Live",
      technologies: "TypeScript, React, Bun, Canvas 2D, Web Workers",
      bullets: [
        "Built an OSINT dashboard visualizing eight live data sources on an interactive globe.",
        "Wrote a Canvas 2D rendering engine running in Web Workers.",
        "Added cross-source correlation, scored alerts, watch notifications, and offline PWA support.",
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
      name: "O-Tether",
      status: "Shipped, closed source",
      technologies: "ARM security appliance",
      bullets: [
        "Shipped an inline security appliance for low-cost ARM hardware.",
        "Combined a phone-tether bridge with a default-deny firewall, threat filtering, and intrusion prevention.",
        "Added signed releases and fail-closed behavior.",
      ],
      links: [
        {
          label: "Case study",
          href: "https://wedefendit.com/services/custom-solutions/o-tether",
        },
      ],
    },
    {
      name: "SAFE-PC",
      status: "Completed capstone prototype",
      technologies: "Python, Proxmox VE, OPNsense, Suricata, Unbound DNS",
      bullets: [
        "Built a framework converting end-of-life x86-64 hardware into unattended security appliances.",
        "Automated firewall, IDS, and DNS filtering setup via Python and REST APIs.",
        "Cut setup time from 2+ hours to 15-47 minutes.",
      ],
      links: [
        {
          label: "Source",
          href: "https://github.com/iiTONELOC/safe-pc",
        },
      ],
    },
    {
      name: "0xDL and pveauto",
      status: "Published Rust projects",
      technologies: "Rust",
      bullets: [
        "Published 0xDL (async downloads with integrity checks) and pveauto (Proxmox VE ISO download/verify) on crates.io.",
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
        "Implemented scheduling, synchronization, IPC, interrupts, syscalls, and disk I/O in the THREADS kernel.",
        "Co-authored “Investigating Covert IPC in THREADS” for Cyber Recon '25.",
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
