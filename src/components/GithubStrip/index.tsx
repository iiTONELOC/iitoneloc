import { JSX } from "react";
import { SectionHead } from "../SectionHead";
import { githubStripRepos } from "@/constants/repos";
import { RepoCard } from "./RepoCard";

const styles = {
  sec: "pb-16 pt-[30px]",
  wrap: "mx-auto max-w-wrap px-[30px]",
  grid: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * `// from github` strip: a curated, static set of repos. Renders instantly
 * with no GitHub dependency at page load. Edit src/constants/repos.ts to change
 * which repos show or to refresh their metadata.
 */
export const GithubStrip = (): JSX.Element => {
  return (
    <section className={styles.sec} id="github">
      <div className={styles.wrap}>
        <SectionHead marker="from github" count="@iiTONELOC" />
        <div className={styles.grid}>
          {githubStripRepos.map((repo) => (
            <RepoCard key={repo.name} repo={repo} />
          ))}
        </div>
      </div>
    </section>
  );
};
