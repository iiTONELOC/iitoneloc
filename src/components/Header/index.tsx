import { JSX } from "react";
import { NavBar } from "../NavBar";
import { NavLink } from "../NavLink";

const headerStyles = {
  header:
    "w-full h-auto flex flex-wrap flex-row justify-between items-center px-5 py-2 border-b-[1px] border-gray-500",
};

/**
 * Renders a header component with a title and optional children
 * @param children - Child components to render
 * @returns A header component
 */
export const Header = (): JSX.Element => {
  return (
    <header className={headerStyles.header}>
      <h1>
        <NavLink to={"/"} text="Anthony T" isTitle={true} />
      </h1>
      <NavBar />
    </header>
  );
};
