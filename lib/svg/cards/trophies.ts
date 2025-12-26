import type { Theme } from "../themes";
import type { GitHubStats } from "../../github/types";
import { escapeXml } from "../builder";

interface Trophy {
  name: string;
  icon: string;
  condition: (stats: GitHubStats) => boolean;
  description: string;
}

const TROPHIES: Trophy[] = [
  {
    name: "Star Collector",
    icon: "⭐",
    condition: (stats) => stats.totalStars >= 100,
    description: "100+ Stars",
  },
  {
    name: "Mega Star",
    icon: "🌟",
    condition: (stats) => stats.totalStars >= 1000,
    description: "1000+ Stars",
  },
  {
    name: "Commit Master",
    icon: "💪",
    condition: (stats) => stats.totalCommits >= 1000,
    description: "1000+ Commits",
  },
  {
    name: "Polyglot",
    icon: "🗣️",
    condition: (stats) => Object.keys(stats.languages).length >= 5,
    description: "5+ Languages",
  },
  {
    name: "Early Adopter",
    icon: "🚀",
    condition: (stats) => {
      const accountAge =
        (Date.now() - new Date(stats.user.created_at).getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      return accountAge >= 5;
    },
    description: "5+ Years",
  },
  {
    name: "Popular",
    icon: "👥",
    condition: (stats) => stats.user.followers >= 100,
    description: "100+ Followers",
  },
  {
    name: "Prolific",
    icon: "📦",
    condition: (stats) => stats.user.public_repos >= 50,
    description: "50+ Repos",
  },
  {
    name: "Streak Master",
    icon: "🔥",
    condition: (stats) => stats.currentStreak >= 30,
    description: "30+ Day Streak",
  },
];

export function generateTrophiesCard(
  stats: GitHubStats,
  theme: Theme,
  width: number = 400,
  height: number = 200
): string {
  const padding = 20;
  const trophySize = 60;
  const trophySpacing = 80;
  const trophiesPerRow = 4;

  const earnedTrophies = TROPHIES.filter((trophy) => trophy.condition(stats));

  let content = `
    <!-- Background -->
    <rect
      x="0"
      y="0"
      width="${width}"
      height="${height}"
      fill="${theme.colors.background}"
      rx="${theme.borderRadius}"
      stroke="${theme.colors.border}"
      stroke-width="1"
      style="filter: drop-shadow(${theme.shadow})"
    />

    <!-- Title -->
    <text
      x="${padding}"
      y="${padding + 20}"
      font-family="${theme.fonts.primary}"
      font-size="18"
      font-weight="600"
      fill="${theme.colors.text}"
    >
      ${escapeXml(
        `🏆 Achievements (${earnedTrophies.length}/${TROPHIES.length})`
      )}
    </text>

    <!-- Trophies Grid -->
  `;

  earnedTrophies.slice(0, 8).forEach((trophy, index) => {
    const col = index % trophiesPerRow;
    const row = Math.floor(index / trophiesPerRow);
    const x = padding + col * trophySpacing;
    const y = 60 + row * trophySpacing;

    content += `
      <g>
        <!-- Trophy icon -->
        <text
          x="${x + trophySize / 2}"
          y="${y + trophySize / 2}"
          font-size="32"
          text-anchor="middle"
        >
          ${trophy.icon}
        </text>

        <!-- Trophy description -->
        <text
          x="${x + trophySize / 2}"
          y="${y + trophySize + 5}"
          font-family="${theme.fonts.primary}"
          font-size="9"
          fill="${theme.colors.textSecondary}"
          text-anchor="middle"
        >
          ${escapeXml(trophy.description)}
        </text>
      </g>
    `;
  });

  return content;
}
