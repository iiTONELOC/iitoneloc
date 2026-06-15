"use client";

import { JSX, useEffect, useState } from "react";
import { Link, links } from "@/constants/links";

const styles = {
  nav: "sticky top-0 z-50 border-b border-op-border bg-op-bg/[0.74] backdrop-blur-[10px]",
  wrap: "mx-auto flex h-[60px] max-w-wrap items-center justify-between px-5 sm:px-[30px]",
  brand: "font-mono text-[14px] font-medium",
  brandAccent: "font-bold text-op-accent",
  links: "hidden gap-[26px] font-mono text-[13px] md:flex",
  link: "text-op-muted transition-colors duration-150 hover:text-op-accent",
  linkActive: "text-op-accent transition-colors duration-150",
  burger:
    "flex h-9 w-9 items-center justify-center text-op-muted transition-colors hover:text-op-accent md:hidden",
  panel:
    "absolute inset-x-0 top-[60px] border-b border-op-border bg-op-bg/95 backdrop-blur-[10px] md:hidden",
  panelInner: "mx-auto flex max-w-wrap flex-col px-5 py-2 sm:px-[30px]",
  panelLink: "py-3 font-mono text-[14px]",
};

const sectionIds = links.map((l) => l.to.replace("#", ""));

/**
 * Sticky, blurred navigation. Inline links on desktop; a hamburger dropdown on
 * mobile. The active link lights up via a scroll spy (section crossing the
 * middle of the viewport), and tapping a link sets it and closes the menu.
 */
export const SiteNav = (): JSX.Element => {
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
    <nav className={styles.nav}>
      <div className={styles.wrap}>
        <div className={styles.brand}>
          <span className={styles.brandAccent}>$</span>{" "}
          atropeano<span className={styles.brandAccent}>_</span>
        </div>

        <div className={styles.links}>
          {links.map((link: Link) => {
            const id = link.to.replace("#", "");
            const isActive = active === id;
            return (
              <a
                key={link.to}
                href={link.to}
                className={isActive ? styles.linkActive : styles.link}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActive(id)}
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
              const id = link.to.replace("#", "");
              const isActive = active === id;
              return (
                <a
                  key={link.to}
                  href={link.to}
                  className={`${styles.panelLink} ${
                    isActive ? "text-op-accent" : "text-op-muted"
                  }`}
                  aria-current={isActive ? "true" : undefined}
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
