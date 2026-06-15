"use client";

import { JSX, useEffect, useState } from "react";
import { Link, links } from "@/constants/links";

const styles = {
  nav: "sticky top-0 z-50 border-b border-op-border bg-op-bg/[0.74] backdrop-blur-[10px]",
  wrap: "mx-auto flex h-[60px] max-w-wrap items-center justify-between px-[30px]",
  brand: "font-mono text-[14px] font-medium",
  brandAccent: "font-bold text-op-accent",
  links: "hidden gap-[26px] font-mono text-[13px] md:flex",
  link: "text-op-muted transition-colors duration-150 hover:text-op-accent",
  linkActive: "text-op-accent transition-colors duration-150",
};

const sectionIds = links.map((l) => l.to.replace("#", ""));

/**
 * Sticky, blurred navigation. The active link lights up via a scroll spy: a
 * section becomes active when it crosses the middle band of the viewport, and a
 * click sets it immediately.
 */
export const SiteNav = (): JSX.Element => {
  const [active, setActive] = useState<string>("");

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
      </div>
    </nav>
  );
};
