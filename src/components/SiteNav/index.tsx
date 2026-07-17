"use client";

import { usePathname } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { links } from "@/constants/links";
import type { Link } from "@/constants/links";

const styles = {
  nav: "sticky top-0 z-50 border-b border-op-border bg-op-bg/[0.74] backdrop-blur-[10px] print:hidden",
  wrap: "mx-auto flex h-[60px] max-w-wrap items-center justify-between px-5 sm:px-[30px]",
  brand: "font-mono text-[14px] font-medium",
  brandAccent: "font-bold text-op-accent",
  links: "hidden gap-[26px] font-mono text-[13px] md:flex",
  link: "inline-flex min-h-11 items-center text-op-muted transition-colors duration-150 hover:text-op-accent",
  linkActive: "inline-flex min-h-11 items-center text-op-accent transition-colors duration-150",
  burger:
    "flex h-11 w-11 items-center justify-center text-op-muted transition-colors hover:text-op-accent md:hidden",
  panel:
    "absolute inset-x-0 top-[60px] border-b border-op-border bg-op-bg/95 backdrop-blur-[10px] md:hidden",
  panelInner: "mx-auto flex max-w-wrap flex-col px-5 py-2 sm:px-[30px]",
  panelLink: "flex min-h-11 items-center py-3 font-mono text-[14px]",
};

const getSectionId = (href: string): string => href.split("#")[1] ?? "";

const sectionIds = links
  .map((link) => getSectionId(link.to))
  .filter((id) => id.length > 0);

export const SiteNav = (): JSX.Element => {
  const pathname = usePathname();
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const onPick = (id: string) => {
    setActive(id);
    setOpen(false);
  };

  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <div className={styles.wrap}>
        <div className={styles.brand}>
          <span className={styles.brandAccent}>$</span>{" "}
          atropeano<span className={styles.brandAccent}>_</span>
        </div>

        <div className={styles.links}>
          {links.map((link: Link) => {
            const id = getSectionId(link.to);
            const isActive = id ? active === id : pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                className={isActive ? styles.linkActive : styles.link}
                aria-current={isActive ? (id ? "location" : "page") : undefined}
                onClick={() => onPick(id)}
              >
                {`// ${link.text}`}
              </a>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div className={styles.panel}>
          <div className={styles.panelInner}>
            {links.map((link: Link) => {
              const id = getSectionId(link.to);
              const isActive = id ? active === id : pathname === link.to;
              return (
                <a
                  key={link.to}
                  href={link.to}
                  className={`${styles.panelLink} ${
                    isActive ? "text-op-accent" : "text-op-muted"
                  }`}
                  aria-current={
                    isActive ? (id ? "location" : "page") : undefined
                  }
                  onClick={() => onPick(id)}
                >
                  {`// ${link.text}`}
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
};
