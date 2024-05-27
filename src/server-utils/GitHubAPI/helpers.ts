import { authHeaders } from "./types";

/**
 * The headers to be used in the API requests
 * @param _authToken A token to be used in the Authorization header
 * @returns The headers object
 */
export function headers(_authToken = ""): authHeaders {
  return {
    Authorization: `bearer ${_authToken}`,
    "Content-Type": "application/json",
  };
}

/**
 * Parses the README file to extract the screenshot or demo URL
 *
 * @param get - The type of content to get from the README, either "screenshot" or "demo"
 * @param readme - The README file to parse
 * @returns The URL of the screenshot or demo
 */
export function readmeParser(
  get: "screenshot" | "demo",
  readme: string
): string | undefined | null {
  const DEMO_REGEX = /#.+Demo?.+\s+.*\s*\[.+\]\(.+\)/g;
  const SCREENSHOT_REGEX = /#+.+Screenshot?.+\s+!\[.+\]\(.+\)/g;

  const matchedContentArray =
    get === "demo" ? readme.match(DEMO_REGEX) : readme.match(SCREENSHOT_REGEX);

  let matchedContent = matchedContentArray ? matchedContentArray[0] : "";

  if (
    (matchedContent === "" || matchedContent === undefined) &&
    get === "screenshot"
  ) {
    // it is not finding the screenshot even though it is there
    // try a less complex regex to see if it can find it
    // the screenshot should be the very first link in the README
    matchedContent = readme.match(/\(.+\)/g)?.[0] ?? "";
  }

  let url: string | undefined | null = null;
  let cleanedContent = matchedContent?.replace(/\s+/g, " ")?.trim();

  if (matchedContent !== "" && get === "screenshot") {
    // remove all extra spacing and newlines
    matchedContent.replace(/\s+/g, " ").trim();

    // extract the URL from the markdown
    const neededPath = cleanedContent.match(/\(.+\)/g)?.[0];
    // remove parentheses
    url = neededPath?.replace(/[()]/g, "").replace("./", "");
  }

  if (get === "demo") {
    const http_s_regex = /https?:\/\/.+/gm;
    const matches = cleanedContent?.match(http_s_regex);
    // if there are multiple http[s] links, then the first link is the cover image
    // while the second link is the demo link as all demos are videos
    // and are being displayed in Markdown as
    // [![Demo](./rel-path-to-cover-image)](https://link-to-demo)
    // or [![Demo](https://link-to-cover-image)](https://link-to-demo)
    const matchedUrl =
      matches && matches.length > 1
        ? matches?.[1]
        : (matches?.[0] ?? "").replace(")", "");
    url = matchedUrl;
  }

  return url?.trim();
}
