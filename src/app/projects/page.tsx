import { JSX } from 'react';
import { Footer, ProjectCard } from '@/components';
import { RepoData, getPinnedRepos } from '@/server-utils';

const styles = {
  main: 'flex h-full w-full flex-col items-center justify-between ',
  header: 'w-full flex flex-col items-center justify-center px-4',
  h1: 'text-center text-3xl md:text-4xl font-bold mt-6',
  h2: 'text-center text-xl xl:text-2xl font-bold text-green-400 mt-6 -mb-8',
  h3: 'w-full text-center text-xl md:text-2xl font-bold ',
  ul: `flex flex-wrap flex-row justify-center items-stretch gap-8 w-full
        max-w-[1200px] p-0 sm-p4 mt-8 p-8`
};

export default async function Projects(): Promise<JSX.Element> {
  const { projectData } = await getPinnedRepos();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Projects</h1>
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
