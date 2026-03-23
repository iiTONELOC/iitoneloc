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
    classes += "text-sig-green hover:text-sig-green-dim text-xl xl:text-2xl font-mono font-bold ";
  } else {
    classes += "text-sm xl:text-base font-mono ";
  }
  if (isCurrentLink && !isTitle) {
    classes +=
      "text-sig-green hover:text-sig-green-dim border-[1px] border-sig-green/40 p-2 rounded-md hover:border-sig-green/60 ";
  }
  if (!isCurrentLink && !isTitle) {
    classes +=
      "text-sig-dim hover:text-gray-300 pr-2 hover:underline underline-offset-8 ";
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
