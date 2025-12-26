import type { Theme } from "../themes";
import { formatNumber, escapeXml } from "../builder";

export function generateCommitsCard(
  totalCommits: number,
  theme: Theme,
  width: number = 400,
  height: number = 200
): string {
  const padding = 20;

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
      Commit Activity
    </text>

    <!-- Subtitle -->
    <text
      x="${padding}"
      y="${padding + 40}"
      font-family="${theme.fonts.primary}"
      font-size="12"
      fill="${theme.colors.textSecondary}"
    >
      Last 12 months
    </text>

    <!-- Main Stat -->
    <text
      x="${width / 2}"
      y="${height / 2 + 10}"
      font-family="${theme.fonts.primary}"
      font-size="48"
      font-weight="700"
      fill="${theme.colors.primary}"
      text-anchor="middle"
    >
      ${formatNumber(totalCommits)}
    </text>

    <text
      x="${width / 2}"
      y="${height / 2 + 35}"
      font-family="${theme.fonts.primary}"
      font-size="14"
      fill="${theme.colors.textSecondary}"
      text-anchor="middle"
    >
      ${escapeXml("Total Commits")}
    </text>

    <!-- Decorative elements -->
    <circle
      cx="${width / 2}"
      cy="${height / 2 + 10}"
      r="80"
      fill="none"
      stroke="${theme.colors.border}"
      stroke-width="1"
      opacity="0.3"
    />
  `;

  return content;
}
