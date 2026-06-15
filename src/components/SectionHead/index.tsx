import { JSX } from "react";

const styles = {
  head: "reveal mb-8 flex items-baseline gap-[14px]",
  marker: "font-mono text-[14px] font-medium text-op-accent",
  line: "h-px flex-1 self-center bg-op-border",
  count: "font-mono text-[12px] text-op-dim",
};

/**
 * Section header: `// <marker>`, a rule line, and an optional right-aligned
 * count / tag. Matches the .sechead block in ref.html.
 */
export const SectionHead = (props: {
  marker: string;
  count?: string;
}): JSX.Element => {
  const { marker, count } = props;
  return (
    <div className={styles.head}>
      <span className={styles.marker}>// {marker}</span>
      <span className={styles.line} />
      {count ? <span className={styles.count}>{count}</span> : null}
    </div>
  );
};
