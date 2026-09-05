import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";

import { externalLinks } from "@/constants/links";
import { resume } from "@/data/resume";

type Experience = (typeof resume.experience)[number];
type Project = (typeof resume.projects)[number];

enum ResumeSectionId {
  Certifications = "resume-certifications",
  Education = "resume-education",
  Experience = "resume-experience",
  Projects = "resume-projects",
  Skills = "resume-skills",
  Summary = "resume-summary",
}

const EXTERNAL_LINK_TARGET = "_blank";
const EXTERNAL_LINK_REL = "noopener noreferrer";

const styles = {
  page: "resume-page min-h-screen px-4 py-8 sm:px-6 sm:py-12",
  actions:
    "resume-actions mx-auto mb-5 flex max-w-[940px] flex-wrap items-center justify-between gap-3 font-mono text-[12.5px]",
  action:
    "inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-op-border-bright bg-op-surface px-4 py-2 text-op-text transition-colors hover:border-op-accent hover:text-op-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-accent",
  actionPrimary:
    "inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-op-accent bg-op-accent px-4 py-2 font-bold text-op-bg transition-colors hover:bg-op-accent-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-accent",
  document:
    "resume-document mx-auto max-w-[940px] rounded-[12px] border border-op-border bg-op-surface px-5 py-7 sm:px-9 sm:py-10 lg:px-12",
  header: "border-b border-op-border pb-7 text-center",
  name: "font-mono text-[clamp(30px,7vw,46px)] font-bold leading-none tracking-[-1px] text-op-text",
  title: "mt-3 font-mono text-[13px] font-medium text-op-accent sm:text-[15px]",
  availability:
    "mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[12px] text-op-muted",
  contacts:
    "mt-3 flex list-none flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[11.5px] not-italic text-op-muted sm:text-[12px]",
  contactLink:
    "inline-flex min-h-11 items-center break-all py-2 transition-colors hover:text-op-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-accent",
  section: "resume-section border-b border-op-border py-7 last:border-b-0",
  heading:
    "mb-4 font-mono text-[13px] font-bold uppercase tracking-[1.2px] text-op-accent",
  body: "text-[15px] leading-[1.72] text-op-text",
  skills: "space-y-3 text-[14.5px] leading-[1.65] text-op-text",
  skillRow: "flex flex-col gap-1 sm:flex-row sm:gap-5",
  skillLabel:
    "font-mono text-[12px] text-op-muted sm:w-[190px] sm:shrink-0",
  skillValue: "sm:flex-1",
  entry: "resume-entry mb-7 last:mb-0",
  entryHead:
    "flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5",
  entryTitle: "text-[16px] font-semibold text-op-text",
  entryMeta: "font-mono text-[12px] text-op-muted sm:text-right",
  degree: "mt-1 text-[14.5px] leading-[1.65] text-op-muted",
  bullets:
    "mt-3 list-disc space-y-2 pl-6 text-[14.5px] leading-[1.65] text-op-text marker:text-op-accent",
  educationEntry:
    "resume-entry border-b border-op-border py-4 first:pt-0 last:border-b-0 last:pb-0",
  honors: "mt-1 text-[13.5px] leading-[1.65] text-op-muted",
  footer:
    "mt-7 font-mono text-xs text-op-muted print:fixed print:inset-x-0 print:bottom-0 print:mt-0 print:border-t print:border-op-border print:pt-2",
  projectMeta:
    "mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11.5px] text-op-muted",
  projectLinks: "mt-1 flex flex-wrap gap-3 font-mono text-[12px]",
  projectLink:
    "inline-flex min-h-11 items-center py-2 text-op-accent transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-op-accent",
};

export const metadata: Metadata = {
  title: "Resume | Anthony Tropeano",
  description:
    "HTML resume for Anthony Tropeano, a security engineer focused on secure systems and infrastructure.",
  alternates: {
    canonical: "/resume",
  },
};

function ExperienceEntry({ item }: Readonly<{ item: Experience }>): JSX.Element {
  return (
    <article className={styles.entry}>
      <div className={styles.entryHead}>
        <h3 className={styles.entryTitle}>
          {item.role} <span aria-hidden>|</span> {item.organization}
        </h3>
        <p className={styles.entryMeta}>{item.dates}</p>
      </div>
      <ul className={styles.bullets}>
        {item.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}

function ProjectEntry({ project }: Readonly<{ project: Project }>): JSX.Element {
  return (
    <article className={styles.entry}>
      <h3 className={styles.entryTitle}>{project.name}</h3>
      <p className={styles.projectMeta}>{project.technologies}</p>
      {project.links.length > 0 ? (
        <nav
          className={styles.projectLinks}
          aria-label={`${project.name} links`}
        >
          {project.links.map((link) => (
            <a
              className={styles.projectLink}
              href={link.href}
              key={link.href}
              target={EXTERNAL_LINK_TARGET}
              rel={EXTERNAL_LINK_REL}
            >
              {link.label} <span aria-hidden>↗</span>
            </a>
          ))}
        </nav>
      ) : null}
      <ul className={styles.bullets}>
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}

export default function ResumePage(): JSX.Element {
  const contactLinks = [resume.phone, resume.email, ...resume.profiles];

  return (
    <main className={styles.page}>
      <nav className={styles.actions} aria-label="Resume actions">
        <Link className={styles.action} href="/">
          <span aria-hidden>←</span> portfolio
        </Link>
        <a
          className={styles.actionPrimary}
          href={externalLinks.resumePdf}
          download="Anthony_Tropeano_Resume.pdf"
        >
          download PDF <span aria-hidden>↓</span>
        </a>
      </nav>

      <div className={styles.document}>
        <header className={styles.header}>
          <h1 className={styles.name}>{resume.name}</h1>
          <p className={styles.title}>{resume.title}</p>
          <p className={styles.availability}>
            <span>{resume.location}</span>
            <span aria-hidden>|</span>
            <span>{resume.availability}</span>
          </p>
          <address>
            <ul className={styles.contacts}>
              {contactLinks.map((link) => {
                const external = link.href.startsWith("https://");

                return (
                  <li key={link.href}>
                    <a
                      className={styles.contactLink}
                      href={link.href}
                      {...(external
                        ? {
                            target: EXTERNAL_LINK_TARGET,
                            rel: EXTERNAL_LINK_REL,
                          }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </address>
        </header>

        <section
          className={styles.section}
          aria-labelledby={ResumeSectionId.Summary}
        >
          <h2 className={styles.heading} id={ResumeSectionId.Summary}>
            Summary
          </h2>
          <p className={styles.body}>{resume.summary}</p>
        </section>

        <section
          className={styles.section}
          aria-labelledby={ResumeSectionId.Skills}
        >
          <h2 className={styles.heading} id={ResumeSectionId.Skills}>
            Technical Skills
          </h2>
          <dl className={styles.skills}>
            {resume.skills.map((skill) => (
              <div className={styles.skillRow} key={skill.label}>
                <dt className={styles.skillLabel}>{skill.label}</dt>
                <dd className={styles.skillValue}>{skill.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className={styles.section}
          aria-labelledby={ResumeSectionId.Experience}
        >
          <h2 className={styles.heading} id={ResumeSectionId.Experience}>
            Professional Experience
          </h2>
          {resume.experience.map((item) => (
            <ExperienceEntry item={item} key={item.organization} />
          ))}
        </section>

        <section
          className={styles.section}
          aria-labelledby={ResumeSectionId.Education}
        >
          <h2 className={styles.heading} id={ResumeSectionId.Education}>
            Education
          </h2>
          {resume.education.map((item) => (
            <article className={styles.educationEntry} key={item.institution}>
              <div className={styles.entryHead}>
                <h3 className={styles.entryTitle}>{item.institution}</h3>
                <p className={styles.entryMeta}>{item.dates}</p>
              </div>
              <p className={styles.degree}>{item.program}</p>
              {item.honors ? (
                <p className={styles.honors}>{item.honors}</p>
              ) : null}
            </article>
          ))}
        </section>

        <section
          className={styles.section}
          aria-labelledby={ResumeSectionId.Certifications}
        >
          <h2 className={styles.heading} id={ResumeSectionId.Certifications}>
            Certifications
          </h2>
          <ul className={styles.bullets}>
            {resume.certifications.map((certification) => (
              <li key={certification}>{certification}</li>
            ))}
          </ul>
        </section>

        <section
          className={styles.section}
          aria-labelledby={ResumeSectionId.Projects}
        >
          <h2 className={styles.heading} id={ResumeSectionId.Projects}>
            Selected Projects
          </h2>
          {resume.projects.map((project) => (
            <ProjectEntry project={project} key={project.name} />
          ))}
        </section>
        <footer className={styles.footer}>{resume.name}</footer>
      </div>
    </main>
  );
}
