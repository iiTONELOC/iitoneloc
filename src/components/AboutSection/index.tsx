import { JSX } from "react";
import { SectionHead } from "../SectionHead";

const styles = {
  sec: "pb-16 pt-[30px]",
  wrap: "mx-auto max-w-wrap px-5 sm:px-[30px]",
  about: "reveal max-w-[760px]",
  p: "mb-4 text-[16.5px] leading-[1.8] text-[#c5c8cf]",
  accent: "font-medium text-op-accent",
};

export const AboutSection = (): JSX.Element => {
  return (
    <section className={styles.sec} id="about">
      <div className={styles.wrap}>
        <SectionHead marker="about" />
        <div className={styles.about}>
          <p className={styles.p}>
            Based in Ocala, Florida, I work across cryptography, application
            architecture, infrastructure, networking, and operations. Because
            security failures often emerge where those layers meet, I trace
            trust assumptions through the full system and turn them into
            constrained interfaces, fail-closed controls, and systems that
            remain practical to deploy and operate.
          </p>
          <p className={styles.p}>
            I founded <span className={styles.accent}>Defend I.T. Solutions</span>{" "}
            and graduated summa cum laude from the University of Arizona&apos;s
            NSA CAE-CO Cyber Operations program. I am starting an{" "}
            <span className={styles.accent}>
              M.S. in Artificial Intelligence (Data Science)
            </span>{" "}
            at Nova Southeastern University in fall 2026. I am open to security
            engineering, DevSecOps, and security-focused software engineering
            roles.
          </p>
        </div>
      </div>
    </section>
  );
};
