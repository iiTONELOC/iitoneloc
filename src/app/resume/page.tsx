"use server";
import { JSX } from "react";
import { Footer, ResumeComponent } from "@/components";

const styles = {
  main: "flex h-full w-full flex-col items-center justify-start ",
  header: "w-full flex flex-col items-center justify-center px-4",
  h1: "text-center text-2xl md:text-3xl xl:text-4xl font-bold mt-8",
  section:
    "w-full max-w-4xl h-full flex flex-row items-center justify-start px-8 py-2",
  embed: "rounded-lg shadow-lg w-auto h-full w-full",
};

export default async function Resume(): Promise<JSX.Element> {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Resume</h1>
      </header>
      <section className={styles.section}>
        <ResumeComponent />
      </section>
      <Footer />
    </main>
  );
}
