"use server";

import { JSX } from "react";
import { VscGithub } from "react-icons/vsc";
import { BiMoviePlay } from "react-icons/bi";
import { IoRocketOutline } from "react-icons/io5";

interface FooterIcons {
  icon: JSX.Element;
  name: string;
  href?: string;
}

const footerStyles = {
  footer:
    "bg-black/20 w-full self-end rounded-b-md flex flex-row justify-evenly items-center p-2",
  footerIcons:
    "text-2xl text-gray-300 hover:text-emerald-400 hover:scale-110 transition duration-300 ease-in-out w-6 h-6 2xl:w-8 2xl:h-8",
};

const FooterIcon = ({ icon, href, name }: FooterIcons): JSX.Element => {
  return (
    <a
      key={href}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Click to see the ${name}`}
    >
      {icon}
    </a>
  );
};

export const ProjectCardFooter = ({
  liveUrl,
  demoUrl,
  repoUrl,
}: {
  liveUrl: string;
  demoUrl: string;
  repoUrl: string;
}): JSX.Element => {
  const footerIcons: FooterIcons[] = [
    {
      name: "deployment",
      //@ts-ignore
      icon: <IoRocketOutline className={footerStyles.footerIcons} />,
      href: liveUrl,
    },
    {
      name: "demo",
      //@ts-ignore
      icon: <BiMoviePlay className={footerStyles.footerIcons} />,
      href: demoUrl,
    },
    {
      name: "GitHub repo",
      //@ts-ignore
      icon: <VscGithub className={footerStyles.footerIcons} />,
      href: repoUrl,
    },
  ];

  return (
    <footer className={footerStyles.footer}>
      {footerIcons.map(({ icon, href, name }) => {
        return (
          href && <FooterIcon key={name} icon={icon} href={href} name={name} />
        );
      })}
    </footer>
  );
};
