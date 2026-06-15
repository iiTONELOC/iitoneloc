import { JSX } from "react";
import { externalLinks } from "@/constants/links";
import { GlobeMount } from "../Globe/GlobeMount";

const styles = {
  hero: "relative py-[70px] pb-[80px]",
  wrap: "mx-auto grid max-w-wrap grid-cols-1 items-center gap-[30px] px-5 sm:px-[30px] md:grid-cols-[1.05fr_0.95fr]",
  left: "order-1 md:order-none",
  designation:
    "mb-5 flex items-center gap-[10px] font-mono text-[12px] tracking-[1.5px] text-op-accent before:h-px before:w-[26px] before:bg-op-accent",
  h1: "mb-[18px] font-mono text-[clamp(38px,6vw,66px)] font-bold leading-none tracking-[-1.5px]",
  role: "mb-6 font-mono text-[clamp(13px,1.7vw,16px)] font-medium text-op-accent",
  sep: "mx-2 text-op-dim",
  lede: "mb-[30px] max-w-[520px] text-[clamp(16px,2.1vw,19px)] text-[#c5c8cf]",
  flags:
    "mb-[34px] flex flex-wrap gap-x-5 gap-y-[9px] font-mono text-[12px] text-op-muted",
  flag: "inline-flex items-center gap-[7px]",
  dot: "h-[6px] w-[6px] rounded-full bg-op-live shadow-[0_0_8px_var(--live)]",
  cta: "flex flex-wrap gap-3",
  btn: "inline-flex items-center gap-[9px] rounded-[6px] border border-op-border-bright bg-op-surface px-[19px] py-[11px] font-mono text-[13px] font-medium text-op-text transition-all duration-150 hover:-translate-y-px hover:border-op-accent hover:text-op-accent",
  btnPrimary:
    "inline-flex items-center gap-[9px] rounded-[6px] border border-op-accent bg-op-accent px-[19px] py-[11px] font-mono text-[13px] font-bold text-[#1a1206] transition-all duration-150 hover:-translate-y-px hover:border-op-accent-hi hover:bg-op-accent-hi",
};

/**
 * Hero: name / role / lede / availability / CTAs on the left, live globe on the
 * right. The globe canvas and its data-bound HUD readouts are added in Phase 4;
 * the right column renders the styled frame and projection label for now.
 */
export const Hero = (): JSX.Element => {
  return (
    <header className={styles.hero} id="top">
      <div className={styles.wrap}>
        <div className={styles.left}>
          <div className={styles.designation}>operator // anthony tropeano</div>
          <h1 className={styles.h1}>
            Anthony
            <br />
            Tropeano
          </h1>
          <div className={styles.role}>
            {/* prettier-ignore */}
            <span>Security Engineer</span><span className={styles.sep}>&middot;</span><span>Applied Cryptography &amp; Secure Systems</span>
          </div>
          <p className={styles.lede}>
            Security engineer who ships code. End-to-end builder across the
            stack: cryptography in Rust, zero-trust architecture, SOC/NOC
            infrastructure, and full-stack development.
          </p>
          <div className={styles.flags}>
            <span className={styles.flag}>
              <span className={styles.dot} />
              available for work
            </span>
            <span className={styles.flag}>remote / relocation</span>
          </div>
          <div className={styles.cta}>
            <a
              className={styles.btnPrimary}
              href={externalLinks.resumePdf}
              target="_blank"
              rel="noopener noreferrer"
            >
              resume.pdf <span>&#8599;</span>
            </a>
            <a className={styles.btn} href="#work">
              view work <span>&#8594;</span>
            </a>
            <a
              className={styles.btn}
              href={externalLinks.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              github <span>&#8599;</span>
            </a>
          </div>
        </div>

        <GlobeMount />
      </div>
    </header>
  );
};
