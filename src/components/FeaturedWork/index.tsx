import { JSX } from "react";
import { SectionHead } from "../SectionHead";
import { projects } from "@/data/projects";
import { ProjectBlock } from "./ProjectBlock";

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

const styles = {
  sec: "pb-16 pt-[30px]",
  wrap: "mx-auto max-w-wrap px-[30px]",
  list: "flex flex-col gap-[18px]",
};

/**
 * `// featured work` section: curated datasheet blocks from src/data/projects.
 */
export const FeaturedWork = (): JSX.Element => {
  return (
    <section className={styles.sec} id="work">
      <div className={styles.wrap}>
        <SectionHead
          marker="featured work"
          count={`${pad2(projects.length)} selected`}
        />
        <div className={styles.list}>
          {projects.map((project) => (
            <ProjectBlock key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};
