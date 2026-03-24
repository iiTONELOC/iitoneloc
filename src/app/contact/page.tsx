import Image from "next/image";
import { Footer } from "@/components";
import { BsGithub, BsLinkedin, BsEnvelope, BsGlobe } from "react-icons/bs";

const styles = {
  main: "w-full h-full flex flex-col items-center justify-between",
  content: "w-full flex-1 flex flex-col items-center justify-center px-6",
  card: "w-full max-w-md border border-sig-border rounded-lg bg-sig-dark-card p-8 md:p-10 flex flex-col items-center gap-6",
  iconWrap: "w-16 h-16 flex items-center justify-center",
  heading: "text-2xl font-bold text-gray-100 tracking-tight -mt-2",
  subtitle: "text-sm text-sig-dim font-mono text-center -mt-2",
  emailBtn:
    "w-full flex items-center justify-center gap-3 text-base font-mono px-6 py-4 border border-sig-green/40 bg-sig-green/5 rounded-md text-sig-green hover:bg-sig-green/10 hover:border-sig-green/60 transition-all duration-200",
  emailIcon: "w-5 h-5 shrink-0",
  phoneBtn:
    "w-full flex items-center justify-center gap-3 text-sm font-mono px-6 py-3 border border-sig-border rounded-md text-sig-dim hover:text-sig-green hover:border-sig-green/40 transition-all duration-200",
  divider: "w-full h-[1px] bg-sig-border",
  linksGrid: "w-full grid grid-cols-3 gap-3",
  linkCard:
    "flex flex-col items-center gap-2 py-4 px-3 border border-sig-border rounded-md text-sig-dim hover:text-sig-green hover:border-sig-green/40 hover:bg-sig-green/5 transition-all duration-200",
  linkIcon: "w-5 h-5",
  linkLabel: "text-xs font-mono uppercase tracking-wider",
};

export default function Contact(): JSX.Element {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <Image
              src="/favicon-192.png"
              alt=""
              width={64}
              height={64}
              priority
            />
          </div>
          <h1 className={styles.heading}>Get in Touch</h1>
          <p className={styles.subtitle}>
            Open to security engineering, DevSecOps, or software engineering
            roles.
          </p>

          <a href="mailto:anthony@wedefendit.com" className={styles.emailBtn}>
            {/* @ts-ignore */}
            <BsEnvelope className={styles.emailIcon} />
            anthony@wedefendit.com
          </a>

          <div className={styles.divider} />

          <div className={styles.linksGrid}>
            <a
              href="https://linkedin.com/in/anthony-t-29353b201/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkCard}
            >
              {/* @ts-ignore */}
              <BsLinkedin className={styles.linkIcon} />
              <span className={styles.linkLabel}>LinkedIn</span>
            </a>
            <a
              href="https://github.com/iiTONELOC"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkCard}
            >
              {/* @ts-ignore */}
              <BsGithub className={styles.linkIcon} />
              <span className={styles.linkLabel}>GitHub</span>
            </a>
            <a
              href="https://wedefendit.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkCard}
            >
              {/* @ts-ignore */}
              <BsGlobe className={styles.linkIcon} />
              <span className={styles.linkLabel}>Website</span>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
