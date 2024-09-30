/**
 * Error message prefix
 */
export const creationErrorPrefix = 'GitHubAPI Creation error:';

/**
 * Generates the REST endpoint for a repo
 * @param owner the owner of the repo
 * @param repo  the repo name
 * @returns `repos/{owner}/{repo}`
 */
export const restRepoEndPoint = (owner: string, repo: string): string =>
  `repos/${owner}/${repo}`;

/**
 * The base URL for the GitHub API
 */
export const gitHubAPIUrl = 'https://api.github.com/';

/**
 * The URL for the GraphQL endpoint
 */
export const graphQLRequestURL = gitHubAPIUrl + 'graphql';
