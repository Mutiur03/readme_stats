/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { fetchAllTimeGitHubStats } from "@/lib/github/fetchers";
import { generateStatsSVG } from "@/lib/svg";
import type { SVGConfig } from "@/lib/github/types";
import { GitHubAPIError } from "@/lib/github/client";



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
    const start = performance.now();
    const stats = await fetchAllTimeGitHubStats(config.username);
    const fetchDuration = performance.now() - start;

    console.log(
      `[${config.username}] Fetched from GitHub in ${fetchDuration.toFixed(
        2
      )}ms`
    );
   
    const genStart = performance.now();
    const svg = generateStatsSVG(stats, config);
    const genDuration = performance.now() - genStart;

    console.log(
      `[${config.username}] SVG generated in ${genDuration.toFixed(2)}ms`
    );

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=172800",
      },
    });
  } catch (error) {
    if (error instanceof GitHubAPIError) {
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
