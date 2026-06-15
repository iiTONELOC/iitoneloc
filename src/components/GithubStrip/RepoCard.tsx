import { JSX } from "react";
import type { GithubRepo } from "@/constants/repos";

// GitHub linguist-style language colors; neutral fallback for anything unmapped.
const langColors: Record<string, string> = {
  Rust: "#dea584",
  C: "#7888a5",
  "C++": "#f34b7d",
  Python: "#3572a5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00add8",
};

const styles = {
  repo: "reveal flex h-full flex-col rounded-[8px] border border-op-border bg-op-surface px-[17px] py-[15px] transition-colors duration-150 hover:border-op-border-bright",
  name: "mb-[6px] font-mono text-[14px] font-medium text-op-accent",
  desc: "mb-3 text-[13px] leading-[1.5] text-op-muted",
  meta: "mt-auto flex items-center gap-4 border-t border-op-border pt-3 font-mono text-[11.5px] text-op-dim",
  lang: "inline-flex items-center gap-[6px]",
  dot: "h-[9px] w-[9px] rounded-full",
};

function updatedYear(date: string): string | null {
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? `updated '${year.slice(-2)}` : null;
}

export const RepoCard = (props: { repo: GithubRepo }): JSX.Element => {
  const { repo } = props;
  const dot = langColors[repo.language] ?? "#888d99";
  const updated = updatedYear(repo.updated);

  return (
    <a
      className={styles.repo}
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.name}>{repo.name}</div>
      {repo.description ? (
        <div className={styles.desc}>{repo.description}</div>
      ) : null}
      <div className={styles.meta}>
        {repo.language ? (
          <span className={styles.lang}>
            <span
              className={styles.dot}
              style={{ backgroundColor: dot }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        ) : null}
        {updated ? <span>{updated}</span> : null}
      </div>
    </a>
  );
};
