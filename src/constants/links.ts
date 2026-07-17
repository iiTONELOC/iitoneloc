export const links = [
  { to: "/#work", text: "work" },
  { to: "/#github", text: "github" },
  { to: "/#about", text: "about" },
  { to: "/#contact", text: "contact" },
  { to: "/resume", text: "resume" },
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
  resume: "/resume",
  resumePdf: "/documents/anthony_tropeano_resume.pdf",
};
