"use server";

import { JSX } from "react";
import { VscGithub } from "react-icons/vsc";
import { BiMoviePlay } from "react-icons/bi";
import { IoRocketOutline } from "react-icons/io5";

interface FooterIcons {
  icon: JSX.Element;
  label: string;
  name: string;
  href?: string;
}

const footerStyles = {
  footer:
    "w-full self-end rounded-b-md flex flex-row justify-evenly items-center p-2 border-t border-sig-border bg-sig-dark/40",
  linkWrap:
    "flex flex-col items-center gap-1 text-sig-dim hover:text-sig-green transition-colors duration-200",
  icon: "w-5 h-5 2xl:w-6 2xl:h-6",
  label: "text-[10px] font-mono uppercase tracking-wider",
};

const FooterIcon = ({ icon, href, name, label }: FooterIcons): JSX.Element => {
  return (
    <a
      key={href}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Click to see the ${name}`}
      className={footerStyles.linkWrap}
    >
      {icon}
      <span className={footerStyles.label}>{label}</span>
    </a>
  );
};

export const ProjectCardFooter = async ({
  liveUrl,
  demoUrl,
  repoUrl,
}: {
  liveUrl: string;
  demoUrl: string;
  repoUrl: string;
}): Promise<JSX.Element> => {
  const footerIcons: FooterIcons[] = [
    {
      name: "deployment",
      label: "Live",
      //@ts-ignore
      icon: <IoRocketOutline className={footerStyles.icon} />,
      href: liveUrl,
    },
    {
      name: "demo",
      label: "Demo",
      //@ts-ignore
      icon: <BiMoviePlay className={footerStyles.icon} />,
      href: demoUrl,
    },
    {
      name: "GitHub repo",
      label: "Source",
      //@ts-ignore
      icon: <VscGithub className={footerStyles.icon} />,
      href: repoUrl,
    },
  ];

  return (
    <footer className={footerStyles.footer}>
      {footerIcons.map(({ icon, href, name, label }) => {
        return (
          href && <FooterIcon key={name} icon={icon} href={href} name={name} label={label} />
        );
      })}
    </footer>
  );
};
