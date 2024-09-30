import { JSX } from "react";
import { BsGithub, BsLinkedin, BsEnvelope } from "react-icons/bs";

type footerLink = {
  href: string;
  name: string;
  icon: JSX.Element;
};

const componentStyles = {
  footer:
    "w-full h-auto flex flex-wrap flex-row justify-center items-center gap-2 p-3",
  linkSection:
    "w-full h-auto flex flex-wrap flex-row justify-center items-center gap-8",
  footerLink: "text-gray-400 hover:text-green-600 hover:cursor-pointer",
  copyWrite: "text-gray-400 text-xs 2xl:text-sm text-shadow",
  linkIcon: "w-6 h-6 2xl:h-8 2xl:w-8",
  link: "text-green-400 hover:text-green-400 underline hover:cursor-pointer",
};

const footerLinks: footerLink[] = [
  {
    name: "GitHub",
    href: `https://github.com/iitoneloc`,
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
    name: "Email",
    href: `mailto:anthony@atropeano.com`,
    //@ts-ignore
    icon: <BsEnvelope className={componentStyles.linkIcon} />,
  },
];

export const Footer = (): JSX.Element => {
  // NOSONAR
  const currentYear = new Date().getFullYear();
  const copyWriteText = `© ${currentYear} Anthony Tropeano. Built with`;

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
