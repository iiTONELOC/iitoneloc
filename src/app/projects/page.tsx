import { JSX } from "react";
import { Footer, ProjectCard } from "@/components";
import { RepoData, getPinnedRepos } from "@/server-utils";

const styles = {
  main: "flex h-full w-full flex-col items-center justify-between",
  header: "w-full flex flex-col items-center justify-center px-4 pt-8 pb-2",
  h1: "text-3xl md:text-4xl font-bold text-gray-100 tracking-tight",
  subtitle: "text-sm font-mono text-sig-dim mt-2",
  ul: `flex flex-wrap flex-row justify-center items-stretch gap-8 w-full
        max-w-[1200px] p-0 sm-p4 mt-8 p-8`,
};

export default async function Projects(): Promise<JSX.Element> {
  const { projectData } = await getPinnedRepos();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Projects</h1>
        <p className={styles.subtitle}>Pinned repositories from GitHub</p>
      </header>

      <ul className={styles.ul}>
        {projectData.map((project: RepoData) => (
          <ProjectCard data={project} key={project.name} />
        ))}
      </ul>

      <Footer />
    </main>
  );
}
