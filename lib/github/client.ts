import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Debug logging
if (GITHUB_TOKEN) {
  console.log("✅ GitHub token loaded successfully");
  console.log(`Token length: ${GITHUB_TOKEN.length} characters`);
} else {
  console.warn("⚠️ GitHub token not found. GraphQL features will be limited.");
  console.warn("To enable full features, add GITHUB_TOKEN to .env.local");
}

export const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export const graphqlClient = graphql.defaults({
  headers: {
    authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : "",
  },
});

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rateLimitRemaining?: number
  ) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

export async function handleRateLimit() {
  try {
    const { data } = await octokit.rateLimit.get();
    const remaining = data.rate.remaining;
    const resetTime = new Date(data.rate.reset * 1000);

    if (remaining === 0) {
      throw new GitHubAPIError(
        `Rate limit exceeded. Resets at ${resetTime.toISOString()}`,
        429,
        0
      );
    }

    return {
      remaining,
      resetTime,
      limit: data.rate.limit,
    };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return null;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on 404 or 403
      if (error.status === 404 || error.status === 403) {
        throw new GitHubAPIError(
          error.message || "Resource not found or forbidden",
          error.status
        );
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
