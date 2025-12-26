export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
}

export interface Repository {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  size: number;
}

export interface LanguageStats {
  [language: string]: number;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface GitHubStats {
  user: GitHubUser;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  createdRepositories: number;
  contributedTo: number;
  commitsToMyRepositories: number;
  commitsToAnotherRepositories: number;
  pullRequestsToAnotherRepositories: number;
  contributedToOwnRepositories: number;
  contributedToNotOwnerRepositories: number;
  directStars: number;
  indirectStars: number;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  languages: LanguageStats;
  topRepositories: Repository[];
  lastFetch: string;
}

export interface SVGConfig {
  username: string;
  theme: string;
  cards: string[];
  layout: "grid" | "row" | "column";
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  shadow?: number;
  cardSize?: "small" | "medium" | "large";
  backgroundPattern?: "none" | "dots" | "gradient" | "noise";
}
