export const links = [
  { to: "/#work", text: "work" },
  { to: "/#github", text: "github" },
  { to: "/#about", text: "about" },
  { to: "/#contact", text: "contact" },
  { to: "/resume", text: "resume" },
];

type Links = typeof links;

export type Link = Links[number];

/**
 * Canonical external / off-page destinations referenced across the site.
 */
export const externalLinks = {
  github: "https://github.com/iiTONELOC",
  linkedin: "https://www.linkedin.com/in/atrop/",
  company: "https://wedefendit.com",
  email: "anthony@wedefendit.com",
  sigint: "https://sigint-5154d935429b.herokuapp.com",
  trashscanner: "https://trashscanner.wedefendit.com",
  trashscannerSource: "https://github.com/wedefendit/trashscanner",
  oTetherCaseStudy:
    "https://www.wedefendit.com/services/custom-solutions/o-tether",
  resume: "/resume",
  resumePdf: "/docs/anthony_tropeano_resume.pdf",
};
