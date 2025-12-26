import { octokit, graphqlClient, withRetry, GitHubAPIError } from "./client";
import type {
  GitHubUser,
  Repository,
  LanguageStats,
  ContributionDay,
  GitHubStats,
} from "./types";

export async function fetchUserProfile(username: string): Promise<GitHubUser> {
  return withRetry(async () => {
    try {
      const { data } = await octokit.users.getByUsername({ username });
      return {
        login: data.login,
        name: data.name,
        bio: data.bio,
        avatar_url: data.avatar_url,
        followers: data.followers,
        following: data.following,
        public_repos: data.public_repos,
        public_gists: data.public_gists,
        created_at: data.created_at,
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new GitHubAPIError(`User "${username}" not found`, 404);
      }
      throw error;
    }
  });
}

export async function fetchUserRepositories(
  username: string
): Promise<Repository[]> {
  return withRetry(async () => {
    const repos: Repository[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const { data } = await octokit.repos.listForUser({
        username,
        per_page: perPage,
        page,
        sort: "updated",
      });

      if (data.length === 0) break;

      repos.push(
        ...data.map((repo) => ({
          name: repo.name,
          stargazers_count: repo.stargazers_count || 0,
          forks_count: repo.forks_count || 0,
          language: repo.language || null,
          size: repo.size || 0,
        }))
      );

      if (data.length < perPage) break;
      page++;
    }

    return repos;
  });
}

export async function fetchTotalCommits(username: string): Promise<number> {
  // GraphQL requires authentication, return 0 if no token
  if (!process.env.GITHUB_TOKEN) {
    console.warn("GitHub token not found. Commits data unavailable.");
    return 0;
  }

  return withRetry(async () => {
    try {
      const currentYear = new Date().getFullYear();
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection(from: "${currentYear}-01-01T00:00:00Z") {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `;

      const result: any = await graphqlClient(query, { username });
      return (
        result.user.contributionsCollection.contributionCalendar
          .totalContributions || 0
      );
    } catch (error) {
      console.error("Error fetching commits:", error);
      return 0;
    }
  });
}

export async function fetchContributionStreak(username: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}> {
  // GraphQL requires authentication, return defaults if no token
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "GitHub token not found. Contribution streak data unavailable."
    );
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalContributions: 0,
    };
  }

  return withRetry(async () => {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection(from: "${lastYear}-01-01T00:00:00Z") {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;

      const result: any = await graphqlClient(query, { username });
      const calendar = result.user.contributionsCollection.contributionCalendar;
      const totalContributions = calendar.totalContributions;

      // Flatten all contribution days
      const days: ContributionDay[] = calendar.weeks.flatMap(
        (week: any) => week.contributionDays
      );

      // Calculate streaks - improved algorithm
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let foundToday = false;

      // Get today's date (YYYY-MM-DD format)
      const today = new Date().toISOString().split("T")[0];

      // Reverse to start from most recent
      const reversedDays = [...days].reverse();

      for (let i = 0; i < reversedDays.length; i++) {
        const day = reversedDays[i];
        const isToday = day.date === today;

        if (isToday) {
          foundToday = true;
        }

        if (day.contributionCount > 0) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);

          // Current streak is only valid if it includes today or yesterday
          if (!foundToday || i <= 1) {
            currentStreak = tempStreak;
          }
        } else {
          // Allow one day gap if we haven't found today yet (today might be day 0)
          if (foundToday && currentStreak > 0) {
            // Streak is broken
            currentStreak = 0;
          }
          tempStreak = 0;
        }
      }

      return {
        currentStreak,
        longestStreak,
        totalContributions,
      };
    } catch (error) {
      console.error("Error fetching contribution streak:", error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalContributions: 0,
      };
    }
  });
}

export async function fetchTopLanguages(
  username: string
): Promise<LanguageStats> {
  return withRetry(async () => {
    try {
      const repos = await fetchUserRepositories(username);
      const languageTotals: LanguageStats = {};

      // Get language stats for each repo
      for (const repo of repos) {
        if (!repo.language) continue;

        try {
          const { data } = await octokit.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });

          for (const [lang, bytes] of Object.entries(data)) {
            languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
          }
        } catch (error) {
          // Skip repos we can't access
          continue;
        }
      }

      return languageTotals;
    } catch (error) {
      console.error("Error fetching languages:", error);
      return {};
    }
  });
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  const currentYear = new Date().getFullYear();

  return withRetry(async () => {
    try {
      // 1. Fetch Basic Info & Repos in parallel
      const [user, repos, streakData, languages] = await Promise.all([
        fetchUserProfile(username),
        fetchUserRepositories(username),
        fetchContributionStreak(username),
        fetchTopLanguages(username),
      ]);

      // 2. Fetch Detailed Contributions via GraphQL
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              totalRepositoryContributions
              commitContributionsByRepository {
                repository {
                  nameWithOwner
                  owner { login }
                  stargazerCount
                }
                contributions { totalCount }
              }
              pullRequestContributionsByRepository {
                repository {
                  nameWithOwner
                  owner { login }
                  stargazerCount
                }
                contributions { totalCount }
              }
            }
          }
        }
      `;

      const result: any = await graphqlClient(query, { username });
      const contribs = result.user.contributionsCollection;

      // Calculate localized stats
      let commitsToMyRepositories = 0;
      let commitsToAnotherRepositories = 0;
      let pullRequestsToAnotherRepositories = 0;
      let contributedToOwnRepositories = new Set<string>();
      let contributedToNotOwnerRepositories = new Set<string>();

      const indirectRepoStars = new Map<string, number>();

      contribs.commitContributionsByRepository.forEach((c: any) => {
        const isOwner =
          c.repository.owner.login.toLowerCase() === username.toLowerCase();
        if (isOwner) {
          commitsToMyRepositories += c.contributions.totalCount;
          contributedToOwnRepositories.add(c.repository.nameWithOwner);
        } else {
          commitsToAnotherRepositories += c.contributions.totalCount;
          contributedToNotOwnerRepositories.add(c.repository.nameWithOwner);
          indirectRepoStars.set(
            c.repository.nameWithOwner,
            c.repository.stargazerCount
          );
        }
      });

      contribs.pullRequestContributionsByRepository.forEach((c: any) => {
        const isOwner =
          c.repository.owner.login.toLowerCase() === username.toLowerCase();
        if (!isOwner) {
          pullRequestsToAnotherRepositories += c.contributions.totalCount;
          contributedToNotOwnerRepositories.add(c.repository.nameWithOwner);
          indirectRepoStars.set(
            c.repository.nameWithOwner,
            c.repository.stargazerCount
          );
        } else {
          contributedToOwnRepositories.add(c.repository.nameWithOwner);
        }
      });

      const indirectStars = Array.from(indirectRepoStars.values()).reduce(
        (sum: number, s: number) => sum + s,
        0
      );

      const totalStars = repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
      );
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

      const topRepositories = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5);

      return {
        user,
        totalStars,
        totalForks,
        totalCommits: contribs.totalCommitContributions,
        totalPullRequests: contribs.totalPullRequestContributions,
        totalIssues: contribs.totalIssueContributions,
        createdRepositories: contribs.totalRepositoryContributions,
        contributedTo:
          contributedToOwnRepositories.size +
          contributedToNotOwnerRepositories.size,
        commitsToMyRepositories,
        commitsToAnotherRepositories,
        pullRequestsToAnotherRepositories,
        contributedToOwnRepositories: contributedToOwnRepositories.size,
        contributedToNotOwnerRepositories:
          contributedToNotOwnerRepositories.size,
        directStars: totalStars,
        indirectStars: indirectStars,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        totalContributions: streakData.totalContributions,
        languages,
        topRepositories,
        lastFetch: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof GitHubAPIError) throw error;
      console.error("Fetch error:", error);
      throw new GitHubAPIError(`Failed to fetch stats for ${username}`);
    }
  });
}
