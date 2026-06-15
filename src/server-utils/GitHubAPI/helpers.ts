import { authHeaders } from './types';

/**
 * The headers to be used in the API requests
 * @param _authToken A token to be used in the Authorization header
 * @returns The headers object
 */
export function headers(_authToken = ''): authHeaders {
  return {
    Authorization: `Bearer ${_authToken}`,
    'Content-Type': 'application/json'
  };
}

/** Normalize a parsed markdown URL: drop a leading "./" and trim. */
function cleanUrl(raw: string): string {
  return raw.replace(/^\.\//, '').trim();
}

/**
 * Extract a screenshot URL from README markdown. Ordered fallback, first match
 * wins:
 *   1. a heading containing "Screenshot" followed by an `![alt](url)` image;
 *   2. the first `![screenshot](url)` (alt text is literally "screenshot");
 *   3. the first image of any kind, then the first parenthetical (legacy grab);
 *   4. none -> undefined.
 */
function parseScreenshot(readme: string): string | undefined {
  // (1) "## Screenshot ... ![alt](url)"
  const headingImage =
    /#{1,6}[^\n]*screenshot[^\n]*\r?\n[\s\S]*?!\[[^\]]*\]\(([^)]+)\)/i.exec(
      readme
    );
  if (headingImage?.[1]) return cleanUrl(headingImage[1]);

  // (2) image whose alt text is exactly "screenshot", no heading required
  const altScreenshot = /!\[\s*screenshot\s*\]\(([^)]+)\)/i.exec(readme);
  if (altScreenshot?.[1]) return cleanUrl(altScreenshot[1]);

  // (3) legacy fallback: first image of any kind, else first parenthetical
  const anyImage = /!\[[^\]]*\]\(([^)]+)\)/.exec(readme);
  if (anyImage?.[1]) return cleanUrl(anyImage[1]);

  const firstParen = /\(([^)]+)\)/.exec(readme);
  if (firstParen?.[1]) return cleanUrl(firstParen[1]);

  // (4) nothing found
  return undefined;
}

/**
 * Parses the README file to extract the screenshot or demo URL
 *
 * @param get - The type of content to get from the README, either 'screenshot' or 'demo'
 * @param readme - The README file to parse
 * @returns The URL of the screenshot or demo
 */
export function readmeParser(
  get: 'screenshot' | 'demo',
  readme: string
): string | undefined | null {
  if (get === 'screenshot') {
    return parseScreenshot(readme ?? '');
  }

  const DEMO_REGEX = /#.+Demo?.+\s+.*\s*\[.+\]\(.+\)/g;
  const matchedContentArray = readme.match(DEMO_REGEX);
  const matchedContent = matchedContentArray ? matchedContentArray[0] : '';
  const cleanedContent = matchedContent?.replace(/\s+/g, ' ')?.trim();

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
      : (matches?.[0] ?? '').replace(')', '');

  return matchedUrl?.trim();
}
