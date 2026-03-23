"use server";
import { JSX } from "react";
import { MdCloudDownload } from "react-icons/md";
import { Footer, ResumeComponent } from "@/components";

const styles = {
  main: "flex h-full w-full flex-col items-center justify-start flex-1",
  header:
    "w-full max-w-4xl flex flex-row items-center justify-between px-8 pt-8 pb-2",
  h1: "text-3xl md:text-4xl font-bold text-gray-100 tracking-tight",
  downloadBtn:
    "flex items-center gap-2 text-sm font-mono px-4 py-2 border border-sig-green/40 bg-sig-green/5 rounded-md text-sig-green hover:bg-sig-green/10 hover:border-sig-green/60 transition-all duration-200",
  downloadIcon: "w-4 h-4",
  section:
    "w-full max-w-4xl flex-1 flex flex-col items-center justify-start px-8 py-4",
};

export default async function Resume(): Promise<JSX.Element> {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Resume</h1>
        <a
          className={styles.downloadBtn}
          href="./documents/anthony_tropeano_resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          {/* @ts-ignore */}
          <MdCloudDownload className={styles.downloadIcon} />
          Download PDF
        </a>
      </header>
      <section className={styles.section}>
        <ResumeComponent />
      </section>
      <Footer />
    </main>
  );
}
