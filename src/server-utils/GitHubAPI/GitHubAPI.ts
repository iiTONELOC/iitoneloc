import {
  gitHubAPIUrl,
  restRepoEndPoint,
  graphQLRequestURL,
  creationErrorPrefix,
} from "./constants";
import { headers, readmeParser } from "./helpers";

export interface APIResponseData {
  data: [] | any; //NOSONAR
  errors: [] | any; //NOSONAR
  ok: boolean;
  status: number;
}

interface DemoOptions {
  GITHUB: string;
  DEMO: string;
  NONE: string;
}

export const demoOptions: DemoOptions = {
  GITHUB: "GITHUB",
  DEMO: "DEMO",
  NONE: "NONE",
};

class GitHubAPI {
  user: string;
  readonly #auth: string;

  constructor() {
    const username = process.env.GITHUB_USERNAME;
    const authenticate = process.env.GITHUB_ACCESS_TOKEN;

    if (!username && authenticate) {
      throw new Error(creationErrorPrefix + " A username is required");
    }

    if (!authenticate && username) {
      throw new Error(creationErrorPrefix + " An auth token is required");
    }

    if (!authenticate && !username) {
      throw new Error(
        creationErrorPrefix + " A username and auth token are required"
      );
    }

    this.user = username ?? "";
    this.#auth = authenticate ?? "";
  }

  /**
   * Retrieve the user's repositories
   * returns an object with the following properties:
   * ```js
   * {
   *   data: [], // array of strings containing repo names
   *   errors: [], // array of graphql error objects
   *   ok: boolean, // true if the request was successful
   *   status: number // the status code of the response
   * }
   * ```
   */
  async getPinnedRepoNames(): Promise<APIResponseData> {
    try {
      // Have to use the GraphQL API over the REST API to get the pinned repos
      const query = `query{user(login:"${this.user}"){
                pinnedItems(first: 6, types: REPOSITORY){nodes{...on Repository{name}}}
            }}`;

      const graphRes = await fetch(graphQLRequestURL, {
        method: "POST",
        headers: headers(this.#auth),
        body: JSON.stringify({ query }),
        // revalidate: every 10 minutes
        next: { revalidate: 600 },
      });

      const graphData = await graphRes.json();
      const { data, errors } = graphData;

      const repoNames = data?.user?.pinnedItems?.nodes?.map(
        (node: { name: string }) => node.name
      );

      return {
        data: repoNames || [],
        status: graphRes.status,
        ok: graphRes.ok,
        errors,
      };
    } catch (error) {
      return {
        data: [],
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
   * Retrieve a list of the first 100 repositories
   * returns an object with the following properties:
   * ```js
   * {
   *   data: ['repo1name', 'repo2name', ...'lastRepoName'], // array of strings containing repo names
   *   errors: [], // array of graphql error objects
   *   ok: boolean, // true if the request was successful
   *   status: number // the status code of the response
   * }
   * ```
   */
  async getAllRepoNames(): Promise<APIResponseData> {
    try {
      // Have to use the GraphQL API over the REST API to get the pinned repos
      const query = `query{user(login:"${this.user}"){repositories(first:100) {nodes{name}}}}`;

      const graphRes = await fetch(graphQLRequestURL, {
        method: "POST",
        headers: headers(this.#auth),
        body: JSON.stringify({ query }),
        next: { revalidate: 600 },
      });

      const graphData = await graphRes.json();
      const { data, errors } = graphData;

      const repoNames =
        data?.user?.repositories.nodes?.map(
          (repo: { name?: string }) => repo?.name
        ) || [];

      return {
        data: repoNames,
        status: graphRes.status,
        ok: graphRes.ok,
        errors,
      };
    } catch (error) {
      return {
        data: [],
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
     * Get information about a repo by name
     * @param repoName the name of the repo to look up
     * @returns
     * ```js
     * {
            data: {
                name: // the name of the repo,
                size: // the size of the repo in bytes,
                url: // the url of the repo,
                license: // the license of the repo,
                description: // the description of the repo,
                top_language: // the top language of the repo,
                created_at: // the date the repo was created,
                updated_at: // the date the repo was last updated,
                open_issues: // the number of open issues,
                clone_url: // the url to clone the repo,
            },
            status: res.status,
            ok: res.ok,
            errors: []
        }
    * ```
     */
  async getRepoByName(repoName: string): Promise<APIResponseData> {
    try {
      const URL = gitHubAPIUrl + restRepoEndPoint(this.user, repoName);
      /* istanbul ignore next */
      const res = await fetch(URL, {
        method: "GET",
        headers: headers(this.#auth),
        next: { revalidate: 600 },
      });

      const data = await res.json();
      const repoContents = await this.getRepoContents(repoName);
      // need to fetch more data than this endpoint provides
      const readmeData = await this.getRepoReadmeAsText(repoName, repoContents);

      const repoScreenshot = this.getRepoScreenshot(
        readmeData.data.readme,
        readmeData.data.download_url
      );
      const demoUrl = this.getDemoURL(readmeData.data.readme);

      return {
        data: {
          name: data.name,
          size: data.size,
          repoUrl: data.html_url,
          license: data.license?.name,
          description: data.description,
          topLanguage: data.language,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          openIssues: data.open_issues,
          cloneUrl: data.clone_url,
          liveUrl: data.homepage || "",
          screenshotUrl: repoScreenshot.data.screenshotUrl,
          demoUrl: demoUrl.data.demoUrl || "",
        },
        status: res.status,
        ok: res.ok,
        errors: [],
      };
    } catch (error) {
      return {
        data: {},
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
   * Retrieves an array of objects containing the contents of the repository
   * @param repoName the name of the repo to look up
   */
  async getRepoContents(repoName: string): Promise<APIResponseData> {
    try {
      const URL =
        gitHubAPIUrl + restRepoEndPoint(this.user, repoName) + "/contents";
      /* istanbul ignore next */
      const res = await fetch(URL, {
        method: "GET",
        headers: headers(this.#auth),
        next: { revalidate: 600 },
      });

      const data = await res.json();

      return {
        data,
        status: res.status,
        ok: res.ok,
        errors: [],
      };
    } catch (error) {
      return {
        data: [],
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
     * Retrieves the URLs to download or view the readme of a repository
     * @param repoName the name of the repo to look up
     * @returns
     * ```js
     * {
            data: {
                html_url: 'url',
                download_url: 'url'
            },
            status: res.status,
            ok: res.ok,
            errors: []
        }
    * ```
     */
  async getUrlForRepoReadme(
    repoName: string,
    repoContents?: APIResponseData
  ): Promise<APIResponseData> {
    try {
      const contents: APIResponseData =
        repoContents ?? (await this.getRepoContents(repoName));

      const readme = contents.data.find((file: { name: string }) =>
        file.name.includes("README")
      );

      return {
        data: {
          html_url: readme?.html_url,
          download_url: readme?.download_url,
        },
        status: contents.status,
        ok: contents.ok,
        errors: contents.errors,
      };
    } catch (error) {
      return {
        data: {},
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
    * Retrieves the readme of a repository
    * @param repoName the name of the repo to look up
    * @param repoContents optional parameter to pass in the contents of the repo. 
    * If not provided, the contents will be fetched
    * @returns
    * ```js
    * {
           data: {
               readme: 'string',
           },
           status: res.status,
           ok: res.ok,
           errors: []
       }
   * ```
    */
  async getRepoReadmeAsText(
    repoName: string,
    repoContents?: APIResponseData
  ): Promise<APIResponseData> {
    try {
      /**
       * Get the url for the readme of the repo, passing in the provided repoContents
       * The getRepoReadme method will fetch the contents if they are not provided
       */
      const readme: APIResponseData = await this.getUrlForRepoReadme(
        repoName,
        repoContents
      );

      /**
       * Fetch successful, get the readme text by downloading it
       */
      if (readme.ok) {
        const readmeData = await fetch(readme.data.download_url, {
          next: { revalidate: 600 },
        });
        const readmeText = await readmeData.text();

        return {
          data: {
            readme: readmeText,
            download_url: readme.data.download_url,
          },
          status: readme.status,
          ok: readme.ok,
          errors: readme.errors,
        };
      } else {
        return {
          data: {},
          status: readme.status,
          ok: readme.ok,
          errors: readme.errors,
        };
      }
    } catch (error) {
      return {
        data: {},
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
     * Retrieves the URL for the user's screenshot
     * @param repoName the name of the repo to look up
     * @returns
     * ```js
     * {
            data: {screenshotUrl: 'url'},
            status: res.status,
            ok: res.ok,
            errors: []
        }
    * ```
     */
  getRepoScreenshot(
    readme: string,
    screenShotBasePath: string
  ): APIResponseData {
    try {
      // README screenshots should contain a relative path only
      // we need to build the full URL
      const SCREENSHOT_URL_BASE_PATH = screenShotBasePath.replace(
        "README.md",
        ""
      );

      // parse the README for a screenshot
      const readmeURL = readmeParser("screenshot", readme);

      // return a placeholder if no screenshot is found
      const screenshotUrl = readmeURL
        ? SCREENSHOT_URL_BASE_PATH + readmeURL
        : undefined;

      return {
        data: { screenshotUrl: screenshotUrl?.replace(/README.MD/g, "") },
        status: 200,
        ok: true,
        errors: [],
      };
    } catch (error) {
      return {
        data: {},
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
    * Retrieves the URL for the user's Demo video
    * @param readme The readme API response data
    * @returns
    * ```js
    * {
            data: {demoURL: 'url'},
            status: res.status,
            ok: res.ok,
            errors: []
        }
   * ```
    */
  getDemoURL(readme: string): APIResponseData {
    try {
      // should pull a cached readme if it exists or fetch a new one

      const demoUrl = readmeParser("demo", readme ?? "");

      return {
        data: { demoUrl },
        status: 200,
        ok: true,
        errors: [],
      };
    } catch (error) {
      console.error("Failed to get demo URL", error);
      return {
        data: { demoUrl: "" },
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }

  /**
    * Retrieves the URL for the user's Avatar
    * @returns
    * ```js
    * {
            data: {avatar_url: 'url'},
            status: res.status,
            ok: res.ok,
            errors: []
        }
   * ```
    */
  async getAvatarURL(): Promise<APIResponseData> {
    try {
      const URL = gitHubAPIUrl + "users/" + this.user;
      /* istanbul ignore next */
      const res = await fetch(URL, {
        method: "GET",
        headers: headers(this.#auth),
        next: { revalidate: 600 },
      });

      const data = await res.json();

      return {
        data: {
          avatar_url: data.avatar_url,
        },
        status: res.status,
        ok: res.ok,
        errors: [],
      };
    } catch (error) {
      return {
        data: {},
        status: 500,
        ok: false,
        errors: [error],
      };
    }
  }
}

export const githubAPI = new GitHubAPI();
