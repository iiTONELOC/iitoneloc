import { JSX } from "react";
import type { Project, ProjectStatus } from "@/data/projects";

const statusClass: Record<ProjectStatus, string> = {
  "open-source": "status-oss",
  live: "status-live",
  "in-development": "status-dev",
  closed: "status-closed",
};

const styles = {
  proj: "group relative overflow-hidden rounded-[10px] border border-op-border bg-op-surface px-5 py-5 transition-[border-color] duration-200 hover:border-op-border-bright sm:px-[28px] sm:py-6",
  bar: "absolute inset-y-0 left-0 w-[2px] bg-op-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100",
  top: "mb-[6px] flex flex-wrap items-baseline justify-between gap-4",
  name: "font-mono text-[21px] font-bold tracking-[-0.3px]",
  hook: "mb-[18px] text-[14.5px] text-op-muted",
  desc: "mb-5 max-w-[700px] text-[15px] leading-[1.7] text-[#bcbfc7]",
  details: "border-t border-op-border pt-[14px]",
  summary: "min-h-11 cursor-pointer py-3 font-mono text-[12px] text-op-muted transition-colors hover:text-op-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-accent",
  spec: "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-[28px] gap-y-[15px] pb-1 pt-3",
  label:
    "mb-[6px] font-mono text-[10.5px] uppercase tracking-[1px] text-op-dim",
  val: "font-mono text-[13px] text-op-text",
  tags: "flex flex-wrap gap-[6px]",
  tag: "rounded-[4px] border border-op-border-bright px-2 py-[2px] font-mono text-[11.5px] text-op-muted",
  links: "flex flex-wrap",
  link: "mr-[14px] inline-flex min-h-11 items-center gap-[5px] py-2 font-mono text-[12.5px] text-op-accent transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-accent",
  arrow: "text-[10px] text-op-dim",
};

export const ProjectBlock = (props: { project: Project }): JSX.Element => {
  const { project } = props;

  return (
    <article className={`proj reveal ${styles.proj}`}>
      <span className={styles.bar} aria-hidden="true" />
      <div className={styles.top}>
        <h3 className={styles.name}>{project.name}</h3>
        <span className={`status ${statusClass[project.status]}`}>
          {project.statusLabel}
        </span>
      </div>
      <div className={styles.hook}>{project.hook}</div>
      <div className={styles.desc}>{project.description}</div>

      <details className={styles.details}>
        <summary className={styles.summary}>technical details</summary>
        <div className={styles.spec}>
          <div>
            <div className={styles.label}>Stack</div>
            <div className={styles.tags}>
              {project.stack.map((tech) => (
                <span key={tech} className={styles.tag}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {project.meta.map((m) => (
            <div key={m.label}>
              <div className={styles.label}>{m.label}</div>
              <div className={styles.val}>{m.value}</div>
            </div>
          ))}

        </div>
      </details>

      {project.links.length > 0 && (
        <div className={styles.links}>
          {project.links.map((link) => {
            const external = /^https?:\/\//.test(link.href);
            return (
              <a
                key={link.label}
                href={link.href}
                className={styles.link}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
};
