import { JSX } from "react";
import { BsGithub, BsLinkedin, BsEnvelope, BsGlobe } from "react-icons/bs";

type footerLink = {
  href: string;
  name: string;
  icon: JSX.Element;
};

const componentStyles = {
  footer:
    "w-full h-auto flex flex-wrap flex-col justify-center items-center gap-2 p-3 border-t border-sig-border",
  linkSection:
    "w-full h-auto flex flex-wrap flex-row justify-center items-center gap-8",
  footerLink: "text-sig-dim hover:text-sig-green hover:cursor-pointer transition-colors duration-200",
  copyWrite: "text-sig-dim text-xs 2xl:text-sm",
  linkIcon: "w-6 h-6 2xl:h-8 2xl:w-8",
  link: "text-sig-green-dim hover:text-sig-green underline hover:cursor-pointer transition-colors duration-200",
};

const footerLinks: footerLink[] = [
  {
    name: "GitHub",
    href: `https://github.com/iiTONELOC`,
    //@ts-ignore
    icon: <BsGithub className={componentStyles.linkIcon} />,
  },
  {
    name: "LinkedIn",
    href: `https://linkedin.com/in/anthony-t-29353b201/`,
    //@ts-ignore
    icon: <BsLinkedin className={componentStyles.linkIcon} />,
  },
  {
    name: "Defend I.T. Solutions",
    href: `https://wedefendit.com`,
    //@ts-ignore
    icon: <BsGlobe className={componentStyles.linkIcon} />,
  },
  {
    name: "Email",
    href: `mailto:anthony@wedefendit.com`,
    //@ts-ignore
    icon: <BsEnvelope className={componentStyles.linkIcon} />,
  },
];

export const Footer = (): JSX.Element => {
  // NOSONAR
  const currentYear = new Date().getFullYear();
  const copyWriteText = `\u00A9 ${currentYear} Anthony Tropeano. Built with`;

  return (
    <footer className={componentStyles.footer}>
      <section className={componentStyles.linkSection}>
        {footerLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={componentStyles.footerLink}
          >
            {link.icon}
          </a>
        ))}
      </section>

      <p className={componentStyles.copyWrite}>
        {copyWriteText}{" "}
        <a
          href={"https://nextjs.org/"}
          rel={"noopener noreferrer"}
          className={componentStyles.link}
          target={"_blank"}
        >
          Next.js.
        </a>
      </p>
    </footer>
  );
};
