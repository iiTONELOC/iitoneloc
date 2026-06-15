'use server';

import { githubAPI, ProjectData, RepoData } from '.';

/**
 * Fetches pinned repos from the GitHub API and stores the data in the projectData signal
 * @returns {Promise<{ projectData: ProjectData }>} - The project data
 */
export const getPinnedRepos = async (): Promise<{
  projectData: ProjectData;
}> => {
  let repoNames: string[] = [];
  let currentProjectData: ProjectData = [];

  try {
    /**
     * Get the names of the pinned repos
     */
    repoNames = (await githubAPI.getPinnedRepoNames()).data;
    /**
     * Get the data for each pinned repo in parallel
     */
    const repoDataPromises = repoNames.map(async repoName => {
      const { data } = await githubAPI.getRepoByName(repoName);
      return data as RepoData;
    });
    currentProjectData = await Promise.all(repoDataPromises);
  } catch (error) {
    console.error('Failed to get pinned repos', error);
  }

  return Promise.resolve({
    projectData: currentProjectData
  });
};

/**
 * Fetches a curated, ordered set of repos by name (reusing the cached
 * getRepoByName path). Used by the demoted `// from github` strip so the
 * displayed repos are explicit instead of whatever happens to be pinned.
 * @param names repo names in the desired display order
 */
export const getReposByNames = async (
  names: string[]
): Promise<{ projectData: ProjectData }> => {
  let currentProjectData: ProjectData = [];

  try {
    const repoDataPromises = names.map(async name => {
      const { data } = await githubAPI.getRepoSummary(name);
      const repo = data as RepoData;
      // Surface a dropped repo instead of silently shrinking the strip.
      if (!repo?.name) {
        console.warn(`github strip: dropped "${name}" (no data returned)`);
      }
      return repo;
    });
    const results = await Promise.all(repoDataPromises);
    currentProjectData = results.filter(repo => repo?.name);
  } catch (error) {
    console.error('Failed to get curated repos', error);
  }

  return { projectData: currentProjectData };
};
