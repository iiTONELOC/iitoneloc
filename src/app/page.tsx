import { JSX } from 'react';
import Image from 'next/image';
import { Footer } from '@/components';

const styles = {
  main: 'flex h-full w-full flex-col items-center justify-between ',
  header: 'w-full flex flex-col items-center justify-center px-4',
  h1: 'text-center text-2xl md:text-3xl xl:text-4xl font-bold mt-8',
  h2: 'text-center text-xl xl:text-2xl font-bold text-green-400 mt-6 -mb-8',
  h3: 'w-full text-center text-xl md:text-2xl font-bold ',
  section: 'w-full flex flex-col items-center justify-start py-4',
  avatarImg: 'rounded-full  shadow-lg mt-4',
  aboutMeSection:
    'w-full h-full max-w-[900px] flex flex-col-reverse md:justify-center items-center p-2 mt-4 gap-4',
  aboutMeDiv:
    'w-full h-full flex flex-col items-center justify-start mt-2 py-2 px-12 max-w-[850px] ',
  aboutP:
    'text-left text-sm sm:text-md md:text-base font-medium md:font-regular mt-2 tracking-wide leading-relaxed',
};

const imgDetails = {
  src: '/avatar.png',
  alt: 'Anthony T',
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
        <Image
          className={styles.avatarImg}
          src={imgDetails.src}
          alt={imgDetails.alt}
          width={imgDetails.width}
          height={imgDetails.height}
          priority={imgDetails.priority}
        />

        <div className={styles.aboutMeDiv}>
          <h3 className={styles.h3}>About Me</h3>
          <p className={styles.aboutP}>
            I am a senior in Cybersecurity Engineering at the University of Arizona and hold a
            Full Stack Web Development certificate from the University of Central Florida.
            I enjoy creating secure, efficient, user-friendly web applications and continually
            enhancing my cybersecurity skills. I am experienced in various technologies,
            such as networking, cloud computing, virtualization, software development,
            and low-level programming. I am completing my bachelor&apos;s degree in Cyber Operations
            while working towards cybersecurity certifications including CompTIA&apos;s Network+,
            Security+, and CySA+. I seek internships and/or entry-level cybersecurity or software
            development positions.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
