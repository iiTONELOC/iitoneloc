import { JSX } from "react";

const styles = {
  footer: "border-t border-op-border py-[26px] font-mono text-[12px] text-op-dim",
  wrap: "mx-auto flex max-w-wrap flex-wrap justify-between gap-[10px] px-[30px]",
};

/**
 * Site footer: copyright line.
 */
export const Footer = (): JSX.Element => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <span>{`© ${currentYear} Anthony Tropeano`}</span>
      </div>
    </footer>
  );
};
