/**
 * Removes any underscores or hyphens from the repository name
 * and transforms the name into title case.
 * @param repoName the name of the repository from GitHub
 * @returns
 */
export const formatRepoName: Function = (repoName: string): string => {
  // split the name on any hyphens or underscores
  // and capitalize the first letter of each word

  const delimiter: "_" | "-" = repoName.includes("_") ? "_" : "-";
  const splitName: string[] = repoName.split(delimiter);

  return splitName
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
