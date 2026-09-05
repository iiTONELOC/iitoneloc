import { JSX } from "react";
import { SectionHead } from "../SectionHead";

const styles = {
  sec: "pb-16 pt-[30px]",
  wrap: "mx-auto max-w-wrap px-5 sm:px-[30px]",
  about: "reveal max-w-[760px]",
  p: "mb-4 text-[16.5px] leading-[1.8] text-[#c5c8cf]",
};

export const AboutSection = (): JSX.Element => {
  return (
    <section className={styles.sec} id="about">
      <div className={styles.wrap}>
        <SectionHead marker="about" />
        <div className={styles.about}>
          <p className={styles.p}>
            My work starts with a practical problem: keeping a network usable
            during travel, protecting virtual workloads, or making an
            application work when its connection drops. I work through the
            constraints, build the system, and take responsibility for its
            deployment and operation. That includes deciding what happens when
            a component fails and how the system can recover safely.
          </p>
          <p className={styles.p}>
            Software development and Linux administration are the foundation
            of my security work. As a Python course assistant, I also helped
            students understand their code and work through problems. I
            graduated summa cum laude from the University of Arizona&apos;s Cyber
            Operations program. I am now pursuing a master&apos;s in Artificial
            Intelligence with a Data Science concentration at Nova Southeastern
            University.
          </p>
        </div>
      </div>
    </section>
  );
};
