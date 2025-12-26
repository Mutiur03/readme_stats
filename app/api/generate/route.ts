import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubStats } from "@/lib/github/fetchers";
import { generateStatsSVG } from "@/lib/svg";
import type { SVGConfig, GitHubStats } from "@/lib/github/types";
import { GitHubAPIError } from "@/lib/github/client";
import { log } from "console";

// Two-tier caching system
// 1. Stats cache: Raw GitHub data (1 hour TTL)
const statsCache = new Map<string, { stats: GitHubStats; timestamp: number }>();
const STATS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// 2. SVG cache: Rendered SVGs (24 hour TTL)
const svgCache = new Map<string, { svg: string; timestamp: number }>();
const SVG_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function generateCacheKey(config: SVGConfig): string {
  return `svg:${config.username}:${config.theme}:${config.cards.join(",")}:${
    config.layout
  }:${config.primaryColor || ""}:${config.secondaryColor || ""}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const config: SVGConfig = {
      username: searchParams.get("user") || "",
      theme: searchParams.get("theme") || "dark",
      cards: searchParams.get("cards")?.split(",") || ["unified"],
      layout: (searchParams.get("layout") as any) || "grid",
      primaryColor: searchParams.get("primaryColor") || undefined,
      secondaryColor: searchParams.get("secondaryColor") || undefined,
      backgroundColor: searchParams.get("backgroundColor") || undefined,
      fontFamily: searchParams.get("fontFamily") || undefined,
      borderRadius: searchParams.get("borderRadius")
        ? parseInt(searchParams.get("borderRadius")!)
        : undefined,
      shadow: searchParams.get("shadow")
        ? parseInt(searchParams.get("shadow")!)
        : undefined,
      cardSize: (searchParams.get("cardSize") as any) || "medium",
      backgroundPattern:
        (searchParams.get("backgroundPattern") as any) || "none",
    };

    if (!config.username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const cacheKey = generateCacheKey(config);
    const cachedSvg = svgCache.get(cacheKey);

    if (
      cachedSvg &&
      Date.now() - cachedSvg.timestamp < SVG_CACHE_TTL &&
      !searchParams.get("cache")
    ) {
      return new NextResponse(cachedSvg.svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=172800",
          "X-Cache": "SVG-HIT",
        },
      });
    }

    let stats: GitHubStats;
    const cachedStats = statsCache.get(config.username);

    if (
      cachedStats &&
      Date.now() - cachedStats.timestamp < STATS_CACHE_TTL &&
      !searchParams.get("cache")
    ) {
      stats = cachedStats.stats;
      console.log(`[${config.username}] Stats cache HIT`);
    } else {
      const start = performance.now();
      stats = await fetchGitHubStats(config.username);
      console.log(stats);
      const fetchDuration = performance.now() - start;
      statsCache.set(config.username, {
        stats,
        timestamp: Date.now(),
      });

      console.log(
        `[${config.username}] Fetched from GitHub in ${fetchDuration.toFixed(
          2
        )}ms`
      );
    }

    const genStart = performance.now();
    const svg = generateStatsSVG(stats, config);
    const genDuration = performance.now() - genStart;

    console.log(
      `[${config.username}] SVG generated in ${genDuration.toFixed(2)}ms`
    );

    svgCache.set(cacheKey, {
      svg,
      timestamp: Date.now(),
    });

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=172800",
        "X-Cache": cachedStats ? "STATS-HIT" : "MISS",
      },
    });
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      // Return error as SVG
      const errorSvg = `
        <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="100" fill="#0f172a" rx="8"/>
          <text x="200" y="50" font-family="Arial" font-size="14" fill="#ef4444" text-anchor="middle">
            Error: ${error.message}
          </text>
        </svg>
      `;

      return new NextResponse(errorSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
        status: error.statusCode || 500,
      });
    }

    console.error("Error generating SVG:", error);

    const errorSvg = `
      <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="100" fill="#0f172a" rx="8"/>
        <text x="200" y="50" font-family="Arial" font-size="14" fill="#ef4444" text-anchor="middle">
          Failed to generate stats
        </text>
      </svg>
    `;

    return new NextResponse(errorSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
      status: 500,
    });
  }
}
