import { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components";

const styles = {
  main: "flex h-full w-full flex-col items-center justify-between",
  heroSection:
    "w-full flex flex-col items-center justify-center px-4 pt-10 pb-2",
  avatarImg:
    "rounded-full shadow-lg shadow-sig-green/10 border-2 border-sig-border-bright",
  nameRow: "flex flex-col items-center gap-3 mt-4",
  h1: "text-3xl md:text-4xl xl:text-5xl font-bold text-gray-100 tracking-tight",
  tagline:
    "text-sig-green font-mono text-sm md:text-base tracking-widest uppercase",
  divider: "w-16 h-[2px] bg-sig-green/30 mt-2",
  aboutSection:
    "w-full max-w-[800px] flex flex-col items-start px-8 md:px-12 pt-6 pb-4 gap-5",
  sectionLabel:
    "text-xs font-mono text-sig-green-muted uppercase tracking-[0.2em]",
  aboutP: "text-sm md:text-base leading-relaxed text-gray-400",
  highlight: "text-gray-200",
  inlineLink:
    "text-sig-green hover:text-sig-green-dim underline underline-offset-4 decoration-sig-green/30 hover:decoration-sig-green/60 transition-colors",
  linksRow:
    "w-full max-w-[1000px] flex flex-wrap gap-3 px-8 md:px-12 py-4 justify-center",
  linkBtn:
    "text-xs font-mono px-5 py-2.5 border border-sig-border rounded-md text-sig-dim hover:text-sig-green hover:border-sig-green/40 transition-all duration-200",
  linkBtnPrimary:
    "text-xs font-mono px-5 py-2.5 border border-sig-green/40 bg-sig-green/5 rounded-md text-sig-green hover:bg-sig-green/10 hover:border-sig-green/60 transition-all duration-200",
};

const imgDetails = {
  src: "/avatar.png",
  alt: "Anthony Tropeano",
  width: 160,
  height: 160,
  priority: true,
};

export default function Home(): JSX.Element {
  return (
    <main className={styles.main}>
      <section className={styles.heroSection}>
        <Image
          className={styles.avatarImg}
          src={imgDetails.src}
          alt={imgDetails.alt}
          width={imgDetails.width}
          height={imgDetails.height}
          priority={imgDetails.priority}
        />
        <div className={styles.nameRow}>
          <h1 className={styles.h1}>Anthony Tropeano</h1>
          <p className={styles.tagline}>Security Engineer & Toolmaker</p>
          <div className={styles.divider} />
        </div>
      </section>

      <section className={styles.aboutSection}>
        <p className={styles.sectionLabel}>About</p>
        <p className={styles.aboutP}>
          I&apos;m a security engineer based in Ocala, FL. I{" "}
          <span className={styles.highlight}>build tools</span>,{" "}
          <span className={styles.highlight}>automate infrastructure</span>, and{" "}
          <span className={styles.highlight}>
            write software across the stack
          </span>
          . My primary languages are{" "}
          <span className={styles.highlight}>Python</span>,{" "}
          <span className={styles.highlight}>Rust</span>,{" "}
          <span className={styles.highlight}>C</span>, and{" "}
          <span className={styles.highlight}>TypeScript</span>.
        </p>
        <p className={styles.aboutP}>
          I run{" "}
          <a
            href="https://wedefendit.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inlineLink}
          >
            Defend I.T. Solutions
          </a>
          , a cybersecurity and IT services company, and I&apos;m currently
          building
          <a
            href="https://github.com/iiTONELOC/sigint"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inlineLink}
          >
            SIGINT
          </a>
          , an open-source real-time OSINT dashboard.
        </p>
        <p className={styles.aboutP}>
          I recently graduated summa cum laude from the{" "}
          <span className={styles.highlight}>
            University of Arizona&apos;s NSA CAE-CO Cyber Operations program
          </span>
          , and I&apos;m open to security engineering, DevSecOps, or software
          engineering roles.
        </p>
        <p className={styles.aboutP}>Remote or willing to relocate.</p>
      </section>

      <div className={styles.linksRow}>
        <a
          href="https://sigint-5154d935429b.herokuapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtnPrimary}
        >
          SIGINT Demo
        </a>
        <a
          href="https://github.com/iiTONELOC/sigint"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
        >
          SIGINT Source
        </a>
        <a
          href="https://wedefendit.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
        >
          wedefendit.com
        </a>
        <a
          href="https://github.com/iiTONELOC"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/anthony-t-29353b201/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkBtn}
        >
          LinkedIn
        </a>

        <Link href="/projects" className={styles.linkBtn}>
          Projects
        </Link>
      </div>

      <Footer />
    </main>
  );
}
