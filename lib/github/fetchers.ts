/* eslint-disable @typescript-eslint/no-explicit-any */
import { octokit, graphqlClient, withRetry, GitHubAPIError } from "./client";
import type {
  GitHubUser,
  Repository,
  LanguageStats,
  ContributionDay,
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
  if (!process.env.GITHUB_TOKEN) {
    const streak = await fetchContributionStreak(username);
    return streak.totalContributions;
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
  if (!process.env.GITHUB_TOKEN) {
    try {
      const response = await fetch(
        `https://github.com/users/${username}/contributions`
      );
      if (!response.ok) throw new Error("Failed to fetch contributions");
      const html = await response.text();

      const counts: number[] = [];
      const countMatches = html.matchAll(
        /data-level="\d+".*?>(\d+)\s+contributions/g
      );
      const dates: string[] = [];
      const dateMatches = html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"/g);

      for (const match of countMatches) {
        counts.push(parseInt(match[1]));
      }
      for (const match of dateMatches) {
        dates.push(match[1]);
      }

      if (counts.length === 0) {
        const altMatches = html.matchAll(/(\d+) contributions on/g);
        for (const match of altMatches) {
          counts.push(parseInt(match[1]));
        }
      }

      const days: ContributionDay[] = dates.map((date, i) => ({
        date,
        contributionCount: counts[i] || 0,
      }));

      const totalContributions = counts.reduce((a, b) => a + b, 0);

      return calculateStreak(days, totalContributions);
    } catch (error) {
      console.error("Tokenless streak fetch failed:", error);
      return { currentStreak: 0, longestStreak: 0, totalContributions: 0 };
    }
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

      const days: ContributionDay[] = calendar.weeks.flatMap(
        (week: any) => week.contributionDays
      );

      return calculateStreak(days, totalContributions);
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

function calculateStreak(
  days: ContributionDay[],
  totalContributions: number
): {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
} {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let foundToday = false;

  const today = new Date().toISOString().split("T")[0];

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

      if (!foundToday || i <= 1) {
        currentStreak = tempStreak;
      }
    } else {
      if (foundToday && currentStreak > 0) {
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
}

export async function fetchUserSearchStats(username: string) {
  return withRetry(async () => {
    try {
      const [prs, issues] = await Promise.all([
        octokit.search.issuesAndPullRequests({
          q: `author:${username} type:pr`,
          per_page: 50,
        }),
        octokit.search.issuesAndPullRequests({
          q: `author:${username} type:issue`,
          per_page: 50,
        }),
      ]);

      const contributedRepoFullNames = new Set<string>();
      prs.data.items.forEach((item: any) => {
        const parts = item.repository_url.split("/");
        const owner = parts[parts.length - 2];
        const repo = parts[parts.length - 1];
        if (owner.toLowerCase() !== username.toLowerCase()) {
          contributedRepoFullNames.add(`${owner}/${repo}`);
        }
      });

      return {
        pullRequestsCount: prs.data.total_count,
        issuesCount: issues.data.total_count,
        contributedRepoFullNames: Array.from(contributedRepoFullNames),
      };
    } catch (error) {
      console.error("Search API error:", error);
      return {
        pullRequestsCount: 0,
        issuesCount: 0,
        contributedRepoFullNames: [],
      };
    }
  });
}

// export async function fetchRepositoriesStars(fullNames: string[]) {
//   if (fullNames.length === 0) return 0;

//   return withRetry(async () => {
//     try {
//       const chunks = [];
//       for (let i = 0; i < fullNames.length; i += 10) {
//         chunks.push(fullNames.slice(i, i + 10));
//       }

//       let totalStars = 0;
//       for (const chunk of chunks) {
//         const q = chunk.map((name) => `repo:${name}`).join(" ");
//         const { data } = await octokit.search.repos({ q });
//         data.items.forEach((repo: any) => {
//           totalStars += repo.stargazers_count;
//         });
//       }
//       return totalStars;
//     } catch (error) {
//       console.error("Error fetching repository stars:", error);
//       return 0;
//     }
//   });
// }

export async function fetchTopLanguages(
  username: string
): Promise<LanguageStats> {
  return withRetry(async () => {
    try {
      const repos = await fetchUserRepositories(username);
      const languageTotals: LanguageStats = {};

      if (!process.env.GITHUB_TOKEN) {
        for (const repo of repos) {
          if (repo.language) {
            languageTotals[repo.language] =
              (languageTotals[repo.language] || 0) + (repo.size || 1);
          }
        }
        return languageTotals;
      }

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
        } catch {
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

// async function fetchUserProfile(username: string) {
//   const query = `
//     query ($username: String!) {
//       user(login: $username) {
//         login
//         name
//         avatarUrl
//         createdAt
//         public_repos
//       }
//     }
//   `;
//   const res: any = await graphqlClient(query, { username });
//   return res.user;
// }

// Helper to fetch yearly contributions
async function fetchYearlyContributions(
  username: string,
  from: string,
  to: string
) {
  const query = `
    query ($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalRepositoryContributions
          commitContributionsByRepository(maxRepositories: 100) {
            repository { nameWithOwner }
          }

          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository { nameWithOwner }
          }

          issueContributionsByRepository(maxRepositories: 100) {
            repository { nameWithOwner }
          }
        }
      }
    }
  `;
  const res: any = await graphqlClient(query, { username, from, to });
  return res.user.contributionsCollection;
}

export async function fetchAllTimeGitHubStats(username: string) {
  const user = await fetchUserProfile(username);
  const createdYear = new Date(user.created_at).getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const repos = await fetchUserRepositories(username);

  const totalStars = repos.reduce(
    (acc, repo) => acc + (repo.stargazers_count || 0),
    0
  );
  const totalForks = repos.reduce(
    (acc, repo) => acc + (repo.forks_count || 0),
    0
  );
  const createdRepositories = repos.length;

  let totalCommits = 0;
  let totalPullRequests = 0;
  let totalIssues = 0;

  let commitsToMyRepositories = 0;
  let commitsToAnotherRepositories = 0;
  let pullRequestsToAnotherRepositories = 0;

  const contributedRepos = new Set<string>();

  for (let year = createdYear; year <= currentYear; year++) {
    const from = `${year}-01-01T00:00:00Z`;
    const to = `${year}-12-31T23:59:59Z`;

    const contributions = await fetchYearlyContributions(username, from, to);

    totalCommits += contributions.totalCommitContributions || 0;
    totalPullRequests += contributions.totalPullRequestContributions || 0;
    totalIssues += contributions.totalIssueContributions || 0;

    (contributions.commitContributionsByRepository || []).forEach((r: any) => {
      const fullName = r?.repository?.nameWithOwner;
      if (!fullName) return;
      contributedRepos.add(fullName);
      const c = r.contributions?.totalCount ?? 0;
      if (c > 0) {
        if (fullName.toLowerCase().startsWith(`${username.toLowerCase()}/`)) {
          commitsToMyRepositories += c;
        } else {
          commitsToAnotherRepositories += c;
        }
      }
    });

    (contributions.pullRequestContributionsByRepository || []).forEach(
      (r: any) => {
        const fullName = r?.repository?.nameWithOwner;
        if (!fullName) return;
        contributedRepos.add(fullName);
        const c = r.contributions?.totalCount ?? 0;
        if (c > 0) {
          if (
            !fullName.toLowerCase().startsWith(`${username.toLowerCase()}/`)
          ) {
            pullRequestsToAnotherRepositories += c;
          }
        }
      }
    );

    (contributions.issueContributionsByRepository || []).forEach((r: any) => {
      const fullName = r?.repository?.nameWithOwner;
      if (!fullName) return;
      contributedRepos.add(fullName);
    });
  }

  const contributedToOwnRepositories = Array.from(contributedRepos).filter(
    (f) => f.toLowerCase().startsWith(`${username.toLowerCase()}/`)
  ).length;
  const contributedToNotOwnerRepositories =
    contributedRepos.size - contributedToOwnRepositories;

  const directStars = totalStars;

  let indirectStars = 0;
  for (const fullName of contributedRepos) {
    const parts = fullName.split("/");
    if (parts.length !== 2) continue;
    const owner = parts[0];
    const repoName = parts[1];
    if (owner.toLowerCase() === username.toLowerCase()) continue;
    try {
      const { data } = await octokit.repos.get({ owner, repo: repoName });
      indirectStars += data.stargazers_count || 0;
    } catch {
      continue;
    }
  }

  const languages = await fetchTopLanguages(username);

  const topRepositories = repos
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5);

  const streak = await fetchContributionStreak(username);

  const lastFetch = new Date().toISOString();

  return {
    user: {
      login: user.login,
      name: user.name,
      avatarUrl: user.created_at,
      created_at: user.created_at,
      publicRepos: user.public_repos,
      bio: user.bio,
      avatar_url: user.avatar_url,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      public_gists: user.public_gists,
    },
    totalStars,
    totalForks,
    totalCommits,
    totalPullRequests,
    totalIssues,
    createdRepositories,
    contributedTo: contributedRepos.size,
    commitsToMyRepositories,
    commitsToAnotherRepositories,
    pullRequestsToAnotherRepositories,
    contributedToOwnRepositories,
    contributedToNotOwnerRepositories,
    directStars,
    indirectStars,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalContributions: streak.totalContributions,
    languages,
    topRepositories,
    lastFetch,
  };
}
