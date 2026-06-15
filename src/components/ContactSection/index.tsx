import { JSX } from "react";
import { SectionHead } from "../SectionHead";
import { ContactForm } from "../ContactForm";
import { externalLinks } from "@/constants/links";

const styles = {
  sec: "pb-16 pt-[30px]",
  wrap: "mx-auto max-w-wrap px-5 sm:px-[30px]",
  grid: "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7",
  // flex-col so the info rows can stretch to match the form column's height.
  card: "reveal flex flex-col rounded-[10px] border border-op-border bg-op-surface p-5 sm:p-[26px]",
  row: "flex flex-1 flex-col gap-1 border-b border-op-border py-[13px] font-mono text-[13px] last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-[13.5px]",
  k: "shrink-0 text-op-dim",
  v: "break-all text-op-text sm:text-right",
  vLink: "break-all text-op-text transition-colors hover:text-op-accent sm:text-right",
  formWrap: "reveal",
};

type Row = { k: string; v: string; href?: string };

const rows: Row[] = [
  { k: "email", v: externalLinks.email, href: `mailto:${externalLinks.email}` },
  { k: "github", v: "github.com/iiTONELOC", href: externalLinks.github },
  { k: "linkedin", v: "/in/anthony-t", href: externalLinks.linkedin },
  { k: "company", v: "wedefendit.com", href: externalLinks.company },
  { k: "location", v: "Ocala, FL" },
];

/**
 * `// contact` section: static link card (mockup) plus the working contact
 * form (reCAPTCHA + EmailJS) beneath it.
 */
export const ContactSection = (): JSX.Element => {
  return (
    <section className={styles.sec} id="contact">
      <div className={styles.wrap}>
        <SectionHead marker="contact" />
        <div className={styles.grid}>
          <div className={styles.card}>
            {rows.map((row) => (
              <div key={row.k} className={styles.row}>
                <span className={styles.k}>{row.k}</span>
                {row.href ? (
                  <a
                    className={styles.vLink}
                    href={row.href}
                    {...(row.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {row.v}
                  </a>
                ) : (
                  <span className={styles.v}>{row.v}</span>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formWrap}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};
