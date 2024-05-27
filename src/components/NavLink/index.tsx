"use client";

import { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Builds the class string based on the link state and if the link is a title
 * @param isTitle
 * @param isCurrentLink
 * @returns
 */
const getLinkClasses = (isTitle: boolean, isCurrentLink: boolean): string => {
  let classes = "";
  if (isTitle) {
    classes += "text-green-500 hover:text-emerald-500 text-xl xl:text-2xl ";
  } else {
    classes += "text-sm  xl:text-base ";
  }
  if (isCurrentLink && !isTitle) {
    classes +=
      "text-green-500 hover:text-green-400 border-[1px] border-green-400 p-2 rounded-md hover:border-green-400 ";
  }
  if (!isCurrentLink && !isTitle) {
    classes +=
      "text-gray-400 hover:text-gray-300 pr-2 hover:underline underline-offset-8 ";
  }
  classes += "transition-colors duration-250 ease-in-out";
  return classes;
};

/**
 * Creates a link that updates the current link state signal
 * @param props
 * @param props.to - The URL to navigate to
 * @param props.text - The text to display in the link
 * @param props.isTitle - Optional flag to style the link as a title
 * @returns A link component
 */
export const NavLink = (props: {
  to: string;
  text: string;
  isTitle?: boolean;
}): JSX.Element => {
  let { to, text, isTitle } = props;
  isTitle = isTitle ?? false;

  const pathname = usePathname();

  return (
    <Link href={to} className={getLinkClasses(isTitle, pathname === to)}>
      {text}
    </Link>
  );
};
