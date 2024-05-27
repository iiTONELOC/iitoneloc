"use server";

import { githubAPI, ProjectData, RepoData } from ".";

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
    const repoDataPromises = repoNames.map(async (repoName) => {
      const { data } = await githubAPI.getRepoByName(repoName);
      return data as RepoData;
    });
    currentProjectData = await Promise.all(repoDataPromises);
  } catch (error) {
    console.error("Failed to get pinned repos", error);
  }

  return Promise.resolve({
    projectData: currentProjectData,
  });
};
