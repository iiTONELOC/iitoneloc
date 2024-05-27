export type authHeaders = {
  Authorization: string;
  "Content-Type": string;
};

export type repoByName = {
  name: string;
  htmlUrl: string;
  description: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  openIssues: string;
  cloneUrl: string;
  size: number;
  commitUrl: string;
  repoUrl: string;
  license: { name: string } | null;
};

export type RepoData = {
  name: string;
  size: number;
  repoUrl: string;
  license: string;
  description: string;
  topLanguage: string;
  createdAt: string;
  updatedAt: string;
  openIssues: number;
  cloneUrl: string;
  liveUrl: string;
  screenshotUrl: string;
  demoUrl: string;
};

export type ProjectData = RepoData[];
