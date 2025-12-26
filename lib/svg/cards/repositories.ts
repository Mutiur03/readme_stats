import type { Theme } from "../themes";
import { formatNumber, escapeXml } from "../builder";

export function generateRepositoriesCard(
  totalRepos: number,
  totalStars: number,
  totalForks: number,
  theme: Theme,
  width: number = 400,
  height: number = 200
): string {
  const padding = 20;

  const stats = [
    {
      label: "Total Repositories",
      value: formatNumber(totalRepos),
      icon: "📦",
    },
    { label: "Total Stars", value: formatNumber(totalStars), icon: "⭐" },
    { label: "Total Forks", value: formatNumber(totalForks), icon: "🔱" },
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
      Repository Stats
    </text>

    <!-- Stats -->
  `;

  stats.forEach((stat, index) => {
    const y = 70 + index * 40;

    content += `
      <g>
        <text
          x="${padding}"
          y="${y}"
          font-family="${theme.fonts.primary}"
          font-size="12"
          fill="${theme.colors.textSecondary}"
        >
          ${escapeXml(stat.label)}
        </text>
        <text
          x="${width - padding}"
          y="${y}"
          font-family="${theme.fonts.primary}"
          font-size="20"
          font-weight="700"
          fill="${theme.colors.primary}"
          text-anchor="end"
        >
          ${stat.value}
        </text>
      </g>
    `;
  });

  return content;
}
