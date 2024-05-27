import { JSX } from "react";
import Image from "next/image";
import { Footer } from "@/components";

const styles = {
  main: "flex h-full w-full flex-col items-center justify-between ",
  header: "w-full flex flex-col items-center justify-center px-4",
  h1: "text-center text-2xl md:text-3xl xl:text-4xl font-bold mt-12",
  h2: "text-center text-xl xl:text-2xl font-bold text-green-400 mt-6 -mb-8",
  h3: "w-full text-center text-xl md:text-2xl font-bold ",
  section: "w-full flex flex-col items-center justify-start py-4",
  avatarDiv:
    `relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full 
  before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent
   before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3
    after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br
     before:dark:from-transparent before:dark:to-green-700 before:dark:opacity-10 after:dark:from-emerald-900 after:dark:via-[#22c55e]
      after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]`.replace(
      "/n",
      " "
    ),
  avatarImg: "relative dark:drop-shadow-[0_0_0.3rem_#0F592A]",
  aboutMeSection:
    "w-full h-full max-w-[900px] flex flex-col-reverse md:justify-center items-center p-2 mt-4 gap-4",
  aboutMeDiv:
    "w-full h-full flex flex-col items-center justify-start mt-2 py-2 px-12 max-w-[850px] ",
  aboutP:
    "text-left text-sm sm:text-md md:text-base font-medium md:font-regular mt-2 tracking-wide leading-relaxed",
};

const imgDetails = {
  src: "/avatar.png",
  alt: "Anthony T",
  width: 250,
  height: 250,
  priority: true,
};

export default function Home(): JSX.Element {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Hello, my name is Anthony.</h1>
        <h2 className={styles.h2}>
          I&apos;m an Aspiring Cybersecurity Engineer & Fullstack Web Developer
        </h2>
      </header>
      <section className={styles.section}>
        <div className={styles.avatarDiv}>
          <Image
            className={styles.avatarImg}
            src={imgDetails.src}
            alt={imgDetails.alt}
            width={imgDetails.width}
            height={imgDetails.height}
            priority={imgDetails.priority}
          />
        </div>

        <div className={styles.aboutMeDiv}>
          <h3 className={styles.h3}>About Me</h3>
          <p className={styles.aboutP}>
            I am a Cybersecurity Engineering senior at the University of Arizona
            and hold a Full Stack Web Development certificate from the
            University of Central Florida. I enjoy creating secure, performant,
            and user-friendly web applications and strengthening my cyber
            skills. I have experience with various technologies, including
            networking, cloud computing, virtualization, software development,
            and low-level programming. I am proficient in Python, JavaScript,
            TypeScript, and C. I am finishing my bachelor&apos;s degree in Cyber
            Operations while working on cybersecurity certifications such as
            CompTIA&apos;s Network+, Security+, and CySA+. I am currently
            seeking internships and/or entry-level positions in cybersecurity or
            software development.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
