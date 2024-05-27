import { JSX } from "react";
import { Link, links } from "@/constants/links";
import { NavLink } from "../NavLink";

const navStyles = {
  nav: "w-auto h-auto flex flex-wrap flex-row justify-start items-center p-2",
  ul: "flex flex-wrap flex-row gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 justify-start  items-center",
};

/**
 * Creates a navigation bar component.
 * @returns The navigation bar component with semantic HTML.
 */
export const NavBar = (): JSX.Element => {
  return (
    <nav className={navStyles.nav}>
      <ul className={navStyles.ul}>
        {links.map((link: Link) => (
          <li key={link.to}>
            <NavLink to={link.to} text={link.text} />
          </li>
        ))}
      </ul>
    </nav>
  );
};
