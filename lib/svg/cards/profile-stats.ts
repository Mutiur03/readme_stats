import type { Theme } from "../themes";
import type { GitHubUser } from "../../github/types";
import { formatNumber, escapeXml } from "../builder";

export function generateProfileStatsCard(
  user: GitHubUser,
  theme: Theme,
  width: number = 400,
  height: number = 200
): string {
  const padding = 20;
  const iconSize = 16;
  const statSpacing = 100;

  const stats = [
    { label: "Followers", value: formatNumber(user.followers), icon: "👥" },
    { label: "Following", value: formatNumber(user.following), icon: "➕" },
    { label: "Repos", value: formatNumber(user.public_repos), icon: "📦" },
    { label: "Gists", value: formatNumber(user.public_gists), icon: "📝" },
  ];

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
      Profile Stats
    </text>

    <!-- Stats Grid -->
  `;

  stats.forEach((stat, index) => {
    const x = padding + (index % 2) * statSpacing;
    const y = 70 + Math.floor(index / 2) * 60;

    content += `
      <g>
        <text
          x="${x}"
          y="${y}"
          font-family="${theme.fonts.primary}"
          font-size="12"
          fill="${theme.colors.textSecondary}"
        >
          ${escapeXml(stat.label)}
        </text>
        <text
          x="${x}"
          y="${y + 25}"
          font-family="${theme.fonts.primary}"
          font-size="24"
          font-weight="700"
          fill="${theme.colors.primary}"
        >
          ${stat.value}
        </text>
      </g>
    `;
  });

  return content;
}
