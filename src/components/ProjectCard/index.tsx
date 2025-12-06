"use server";

import { JSX } from "react";
import Image from "next/image";
import { ProjectCardFooter } from "./ProjectCardFooter";
import { RepoData, formatRepoName } from "@/server-utils";

const cardStyles = {
  li: "w-full min-w-min max-w-[450px] lg:max-w-[355px] h-auto hover:bg-slate-600/75 bg-slate-800/75 rounded-lg p-2 flex flex-col justify-start items-center",
  h2: "decoration-gray-300 underline underline-offset-4 text-gray-100 my-2 text-2xl font-bold",
  article:
    "h-full bg-slate-900/80 w-full flex flex-wrap flex-row justify-center items-center rounded-md text-gray-200",
  detailAnchor:
    "w-full  p-1 overflow-hidden  rounded-t-md flex flex-col justify-center",
  img: "text-base object-cover rounded-t-md aspect-video",
  description:
    "tracking-wide text-left p-2 text-xs sm:text-sm 2xl:text-base text-gray-300 mt-2 p-2",
  footer:
    "bg-black/20 w-full self-end rounded-b-md flex flex-row justify-evenly items-center p-2",
  footerIcons:
    "text-2xl text-gray-300 hover:text-emerald-400 hover:scale-110 transition duration-300 ease-in-out",
};

export const ProjectCard = async (props: {
  data: RepoData;
}): Promise<JSX.Element | null> => {
  const { data } = props;
  const { screenshotUrl, description, demoUrl, liveUrl, repoUrl, name } =
    data || {};
  const formattedName: string = formatRepoName(name);

  return (
    <li className={cardStyles.li}>
      <article className={cardStyles.article}>
        {/* Title */}
        <h2 className={cardStyles.h2}>{formattedName}</h2>
        {/* Image container */}
        <a
          className={cardStyles.detailAnchor}
          href={liveUrl || repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Click to visit the ${formattedName} repo`}
        >
          <Image // NOSONAR
            className={cardStyles.img}
            src={screenshotUrl}
            alt={name}
            width={450}
            height={250}
            priority
          />

          <p className={cardStyles.description}>{description}</p>
        </a>

        <ProjectCardFooter
          liveUrl={liveUrl}
          demoUrl={demoUrl}
          repoUrl={repoUrl}
        />
      </article>
    </li>
  );
};
