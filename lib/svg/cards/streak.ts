import type { Theme } from "../themes";
import { formatNumber, escapeXml } from "../builder";

export function generateStreakCard(
  currentStreak: number,
  longestStreak: number,
  totalContributions: number,
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
      🔥 Contribution Streak
    </text>

    <!-- Stats Grid -->
    <g>
      <text
        x="${padding}"
        y="80"
        font-family="${theme.fonts.primary}"
        font-size="12"
        fill="${theme.colors.textSecondary}"
      >
        ${escapeXml("Current Streak")}
      </text>
      <text
        x="${padding}"
        y="105"
        font-family="${theme.fonts.primary}"
        font-size="28"
        font-weight="700"
        fill="${theme.colors.primary}"
      >
        ${currentStreak} days
      </text>
    </g>

    <g>
      <text
        x="${width / 2}"
        y="80"
        font-family="${theme.fonts.primary}"
        font-size="12"
        fill="${theme.colors.textSecondary}"
        text-anchor="middle"
      >
        ${escapeXml("Longest Streak")}
      </text>
      <text
        x="${width / 2}"
        y="105"
        font-family="${theme.fonts.primary}"
        font-size="28"
        font-weight="700"
        fill="${theme.colors.secondary}"
        text-anchor="middle"
      >
        ${longestStreak} days
      </text>
    </g>

    <g>
      <text
        x="${padding}"
        y="150"
        font-family="${theme.fonts.primary}"
        font-size="12"
        fill="${theme.colors.textSecondary}"
      >
        ${escapeXml("Total Contributions")}
      </text>
      <text
        x="${padding}"
        y="175"
        font-family="${theme.fonts.primary}"
        font-size="24"
        font-weight="700"
        fill="${theme.colors.accent}"
      >
        ${formatNumber(totalContributions)}
      </text>
    </g>
  `;

  return content;
}
