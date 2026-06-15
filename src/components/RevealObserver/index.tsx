"use client";

import { useEffect } from "react";

/**
 * Adds the `.in` class to every `.reveal` element as it scrolls into view,
 * matching the IntersectionObserver in ref.html. Renders nothing. Respects
 * reduced-motion via the CSS in globals (reveals are shown immediately there).
 */
export const RevealObserver = (): null => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );

    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 0.06}s`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
};
