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
  sigint: "https://sigint.atropeano.com",
  sigintDemo:
    "https://drive.google.com/file/d/1Qq_q56hDShXZoV0flLYoNHak-mhir7Av/view?usp=share_link",
  trashscanner: "https://trashscanner.wedefendit.com",
  trashscannerSource: "https://github.com/wedefendit/trashscanner",
  safePcSource: "https://github.com/iiTONELOC/safe-pc",
  safePcIsoDemo:
    "https://drive.google.com/file/d/1D4e5CHOru8I3JndtXuie1ork3g2YNsbW/view?usp=sharing",
  safePcInstallDemo:
    "https://drive.google.com/file/d/1JyJ1LLzaks5_ypofQaAbmLkIQhlW2ld3/view?usp=sharing",
  oTetherCaseStudy:
    "https://www.wedefendit.com/services/custom-solutions/o-tether",
  resume: "/resume",
  resumePdf: "/docs/anthony_tropeano_resume.pdf",
};
