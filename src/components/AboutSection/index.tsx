import { JSX } from "react";
import { SectionHead } from "../SectionHead";

const styles = {
  sec: "pb-16 pt-[30px]",
  wrap: "mx-auto max-w-wrap px-[30px]",
  about: "reveal max-w-[760px]",
  p: "mb-4 text-[16.5px] leading-[1.8] text-[#c5c8cf]",
  accent: "font-medium text-op-accent",
};

/**
 * `// about` section: resume-aligned prose, including the MS in AI direction.
 */
export const AboutSection = (): JSX.Element => {
  return (
    <section className={styles.sec} id="about">
      <div className={styles.wrap}>
        <SectionHead marker="about" />
        <div className={styles.about}>
          <p className={styles.p}>
            Security engineer who ships code, based in Ocala, FL. End-to-end
            builder across the stack, from systems-level cryptography in Rust to
            zero-trust application architecture, security tooling, SOC/NOC
            infrastructure, and full-stack development.
          </p>
          <p className={styles.p}>
            Founder of <span className={styles.accent}>Defend I.T. Solutions</span>.
            Summa cum laude graduate of the University of Arizona&apos;s NSA
            CAE-CO Cyber Operations program, now pursuing an{" "}
            <span className={styles.accent}>
              M.S. in Artificial Intelligence (Data Science)
            </span>{" "}
            at Nova Southeastern University. Open to security engineering,
            DevSecOps, or software engineering roles.
          </p>
        </div>
      </div>
    </section>
  );
};
