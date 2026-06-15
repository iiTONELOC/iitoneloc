/**
 * In-page navigation links for the single-scroll home page. The mockup nav
 * renders each as `// <label>` and points at an anchored section.
 */
export const links = [
  { to: "#work", text: "work" },
  { to: "#github", text: "github" },
  { to: "#about", text: "about" },
  { to: "#contact", text: "contact" },
];

export type Links = typeof links;

export type Link = Links[number];

/**
 * Canonical external / off-page destinations referenced across the site.
 */
export const externalLinks = {
  github: "https://github.com/iiTONELOC",
  linkedin: "https://linkedin.com/in/anthony-t-29353b201/",
  company: "https://wedefendit.com",
  email: "anthony@wedefendit.com",
  resumePdf: "/documents/anthony_tropeano_resume.pdf",
};
