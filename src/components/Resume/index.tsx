import { JSX } from "react";
import resumeData from "@/data/resume.json";

const s = {
  resume:
    "w-full max-w-[900px] border border-sig-border rounded-lg bg-sig-dark-card p-6 md:p-10 flex flex-col gap-1 relative z-10",
  name: "text-2xl md:text-3xl font-bold text-gray-100 text-center",
  contactRow:
    "text-xs md:text-sm text-sig-dim font-mono text-center mt-1 flex flex-wrap justify-center gap-x-2",
  contactSep: "text-sig-border hidden sm:inline",
  contactLink:
    "text-sig-dim hover:text-sig-green transition-colors duration-200",
  openTo: "text-xs text-sig-dim italic text-center mt-1",
  sectionTitle:
    "text-xs font-mono font-bold text-gray-200 uppercase tracking-[0.15em] mt-6 mb-1 pb-1 border-b border-sig-border",
  summaryText: "text-sm text-gray-400 leading-relaxed mt-2",
  skillRow: "text-sm text-gray-400 mt-1.5",
  skillLabel: "text-gray-200 font-semibold",
  jobHeader:
    "flex flex-col sm:flex-row sm:items-baseline sm:justify-between mt-4 gap-0.5",
  jobOrg: "text-sm font-bold text-gray-200",
  jobTitle: "text-sm italic text-sig-dim",
  jobDate: "text-xs font-mono text-sig-dim",
  jobLocation: "text-xs text-sig-dim mt-0.5",
  bullet:
    "text-sm text-gray-400 leading-relaxed ml-4 relative before:content-['\\2022'] before:absolute before:-left-3 before:text-sig-green-muted",
  eduHeader:
    "flex flex-col sm:flex-row sm:items-baseline sm:justify-between mt-4 gap-0.5",
  eduSchool: "text-sm font-bold text-gray-200",
  eduDate: "text-xs font-mono text-sig-dim",
  eduDegree: "text-sm italic text-gray-400 mt-0.5",
  eduDetails: "text-xs text-sig-dim mt-0.5",
  certItem: "text-sm text-gray-400 mt-1.5",
  projHeader: "mt-4",
  projName: "text-sm font-bold text-gray-200",
  projTech: "text-xs italic text-sig-dim",
  projDesc: "text-sm text-gray-400 leading-relaxed mt-1",
  projLinks: "text-xs font-mono mt-1 flex flex-wrap gap-x-1",
  projLink:
    "text-sig-green-dim hover:text-sig-green transition-colors duration-200 underline underline-offset-2",
  projLinkSep: "text-sig-border",
  honorsText: "text-sm text-gray-400 mt-2",
  inlineLink:
    "text-sig-green-dim hover:text-sig-green transition-colors duration-200 underline underline-offset-2",
};

/**
 * Auto-links URLs found in text. Handles both http(s):// and bare domain patterns.
 */
function linkifyText(text: string): (string | JSX.Element)[] {
  const urlRegex =
    /(https?:\/\/[^\s,)]+|(?:www\.|github\.com|crates\.io|[a-z0-9-]+\.herokuapp\.com)[^\s,)]*)/gi;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0];
    const href = url.startsWith("http") ? url : `https://${url}`;
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={s.inlineLink}
      >
        {url}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Parses pipe-delimited link strings into clickable links.
 */
function parseLinks(linksStr: string) {
  const parts = linksStr.split("|").map((p) => p.trim());
  return parts.map((part) => {
    const cleaned = part.replace(/^Demo:\s*/i, "").trim();
    const url = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    const label = part.trim();
    return { url, label };
  });
}

export const ResumeComponent = () => {
  const {
    name,
    contact,
    openTo,
    summary,
    skills,
    experience,
    education,
    certifications,
    projects,
    honors,
  } = resumeData;

  return (
    <div className={s.resume}>
      <h1 className={s.name}>{name}</h1>
      <div className={s.contactRow}>
        <a href={`mailto:${contact.email}`} className={s.contactLink}>
          {contact.email}
        </a>
        <span className={s.contactSep}>|</span>
        <a
          href={`tel:${contact.phone.replace(/\./g, "")}`}
          className={s.contactLink}
        >
          {contact.phone}
        </a>
        <span className={s.contactSep}>|</span>
        <span>{contact.location}</span>
        <span className={s.contactSep}>|</span>
        <a
          href={`https://${contact.portfolio}`}
          target="_blank"
          rel="noopener noreferrer"
          className={s.contactLink}
        >
          {contact.portfolio}
        </a>
        <span className={s.contactSep}>|</span>
        <a
          href={`https://${contact.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className={s.contactLink}
        >
          {contact.github}
        </a>
      </div>
      <p className={s.openTo}>{openTo}</p>

      <h2 className={s.sectionTitle}>Professional Summary</h2>
      <p className={s.summaryText}>{summary}</p>

      <h2 className={s.sectionTitle}>Technical Skills</h2>
      {skills.map((skill) => (
        <p key={skill.label} className={s.skillRow}>
          <span className={s.skillLabel}>{skill.label}: </span>
          {skill.items}
        </p>
      ))}

      <h2 className={s.sectionTitle}>Professional Experience</h2>
      {experience.map((job) => (
        <div key={job.company + job.date}>
          <div className={s.jobHeader}>
            <div>
              <span className={s.jobOrg}>{job.company}</span>
              <span className={s.jobTitle}>
                {" | "}
                {job.title}
              </span>
            </div>
            <span className={s.jobDate}>{job.date}</span>
          </div>
          {job.location && <p className={s.jobLocation}>{job.location}</p>}
          <div className="flex flex-col gap-1 mt-1.5">
            {job.bullets.map((b, i) => (
              <p key={i} className={s.bullet}>
                {linkifyText(b)}
              </p>
            ))}
          </div>
        </div>
      ))}

      <h2 className={s.sectionTitle}>Education</h2>
      {education.map((edu) => (
        <div key={edu.school}>
          <div className={s.eduHeader}>
            <span className={s.eduSchool}>{edu.school}</span>
            <span className={s.eduDate}>{edu.date}</span>
          </div>
          <p className={s.eduDegree}>{edu.degree}</p>
          <p className={s.eduDetails}>{edu.details}</p>
        </div>
      ))}

      <h2 className={s.sectionTitle}>Licenses & Certifications</h2>
      {certifications.map((cert) => (
        <p key={cert} className={s.certItem}>
          {cert}
        </p>
      ))}

      <h2 className={s.sectionTitle}>Key Projects & Technical Contributions</h2>
      {projects.map((proj) => (
        <div key={proj.name} className={s.projHeader}>
          <span className={s.projName}>{proj.name}</span>
          <span className={s.projTech}>
            {" | "}
            {proj.tech}
          </span>
          <p className={s.projDesc}>{linkifyText(proj.description)}</p>
          {proj.links && (
            <p className={s.projLinks}>
              {parseLinks(proj.links).map((link, i, arr) => (
                <span key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.projLink}
                  >
                    {link.label}
                  </a>
                  {i < arr.length - 1 && (
                    <span className={s.projLinkSep}>{" | "}</span>
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      ))}

      <h2 className={s.sectionTitle}>Academic Honors</h2>
      <p className={s.honorsText}>{honors}</p>
    </div>
  );
};
