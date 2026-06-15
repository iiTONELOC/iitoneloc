import { JSX } from "react";
import type { Project, ProjectStatus } from "@/data/projects";

const statusClass: Record<ProjectStatus, string> = {
  "open-source": "status-oss",
  published: "status-oss",
  live: "status-live",
  "in-development": "status-dev",
  closed: "status-closed",
};

const styles = {
  proj: "group relative overflow-hidden rounded-[10px] border border-op-border bg-op-surface px-[28px] py-6 transition-[border-color,transform] duration-200 hover:-translate-y-[2px] hover:border-op-border-bright",
  bar: "absolute inset-y-0 left-0 w-[2px] bg-op-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100",
  desig: "mb-[9px] font-mono text-[11px] tracking-[1.5px] text-op-dim",
  top: "mb-[6px] flex flex-wrap items-baseline justify-between gap-4",
  name: "font-mono text-[21px] font-bold tracking-[-0.3px]",
  hook: "mb-[18px] text-[14.5px] text-op-muted",
  desc: "mb-5 max-w-[700px] text-[15px] leading-[1.7] text-[#bcbfc7]",
  spec: "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-[28px] gap-y-[15px] border-t border-op-border pt-[18px]",
  label:
    "mb-[6px] font-mono text-[10.5px] uppercase tracking-[1px] text-op-dim",
  val: "font-mono text-[13px] text-op-text",
  tags: "flex flex-wrap gap-[6px]",
  tag: "rounded-[4px] border border-op-border-bright px-2 py-[2px] font-mono text-[11.5px] text-op-muted",
  links: "flex flex-wrap",
  link: "mr-[14px] inline-flex items-center gap-[5px] font-mono text-[12.5px] text-op-accent transition-opacity hover:opacity-70",
  arrow: "text-[10px] text-op-dim",
};

/**
 * One datasheet project block: designation, name, status pill, hook,
 * description, and a spec grid (Stack tags, meta fields, links).
 */
export const ProjectBlock = (props: { project: Project }): JSX.Element => {
  const { project } = props;

  return (
    <article className={`proj reveal ${styles.proj}`}>
      <span className={styles.bar} aria-hidden="true" />
      <div className={styles.desig}>{project.designation}</div>
      <div className={styles.top}>
        <div className={styles.name}>{project.name}</div>
        <span className={`status ${statusClass[project.status]}`}>
          {project.statusLabel}
        </span>
      </div>
      <div className={styles.hook}>{project.hook}</div>
      <div className={styles.desc}>{project.description}</div>

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

        {project.links.length > 0 && (
          <div>
            <div className={styles.label}>Links</div>
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
                      &#8599;
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
