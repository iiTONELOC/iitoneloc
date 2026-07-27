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
            Based in Ocala, Florida, I work across software, infrastructure,
            networking, and security operations. That range helps me find
            problems at the boundaries between systems. My approach is
            practical: define trust boundaries, limit access, design safe
            failure modes, and keep systems easy to operate.
          </p>
          <p className={styles.p}>
            Professional experience includes founding{" "}
            <span className={styles.accent}>Defend I.T. Solutions</span>{" "}
            and supporting Python courses at the University of Arizona. I
            graduated summa cum laude from the university&apos;s NSA CAE-CO
            Cyber Operations program. Graduate study in{" "}
            <span className={styles.accent}>
              Artificial Intelligence with a Data Science concentration
            </span>{" "}
            begins at Nova Southeastern University in fall 2026. Target roles
            include security engineering, DevSecOps, and secure software
            development.
          </p>
        </div>
      </div>
    </section>
  );
};
