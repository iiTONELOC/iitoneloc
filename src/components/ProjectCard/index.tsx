"use server";

import { JSX } from "react";
import Image from "next/image";
import { ProjectCardFooter } from "./ProjectCardFooter";
import { RepoData, formatRepoName } from "@/server-utils";

const cardStyles = {
  li: "w-full min-w-min max-w-[450px] lg:max-w-[355px] h-auto border border-sig-border rounded-lg overflow-hidden hover:border-sig-border-bright transition-all duration-200 flex flex-col justify-start items-center group",
  article:
    "h-full w-full flex flex-col justify-start items-center bg-sig-dark-card",
  titleRow: "w-full flex items-center justify-center gap-2 py-3 px-3",
  h2: "text-xl font-bold text-gray-100 font-mono",
  langBadge:
    "text-[10px] font-mono px-2 py-0.5 rounded-full border border-sig-green/30 text-sig-green-dim uppercase tracking-wider shrink-0",
  detailAnchor:
    "w-full overflow-hidden flex flex-col justify-center",
  img: "w-full object-cover aspect-video group-hover:scale-[1.02] transition-transform duration-300",
  description:
    "tracking-wide text-left text-xs sm:text-sm text-gray-400 px-4 py-3 leading-relaxed flex-grow",
};

export const ProjectCard = async (props: {
  data: RepoData;
}): Promise<JSX.Element | null> => {
  const { data } = props;
  const { screenshotUrl, description, demoUrl, liveUrl, repoUrl, name, topLanguage } =
    data || {};
  const formattedName: string = formatRepoName(name);

  return (
    <li className={cardStyles.li}>
      <article className={cardStyles.article}>
        {/* Title + language badge */}
        <div className={cardStyles.titleRow}>
          <h2 className={cardStyles.h2}>{formattedName}</h2>
          {topLanguage && (
            <span className={cardStyles.langBadge}>{topLanguage}</span>
          )}
        </div>

        {/* Screenshot */}
        <a
          className={cardStyles.detailAnchor}
          href={liveUrl || repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Click to visit the ${formattedName} repo`}
        >
          <Image
            className={cardStyles.img}
            src={screenshotUrl}
            alt={name}
            width={450}
            height={250}
            priority
          />
        </a>

        {/* Description */}
        <p className={cardStyles.description}>{description}</p>

        {/* Footer with links */}
        <ProjectCardFooter
          liveUrl={liveUrl}
          demoUrl={demoUrl}
          repoUrl={repoUrl}
        />
      </article>
    </li>
  );
};
