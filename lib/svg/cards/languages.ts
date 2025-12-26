import type { Theme } from "../themes";
import type { LanguageStats } from "../../github/types";
import { escapeXml } from "../builder";

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  React: "#61dafb",
};

export function generateLanguagesCard(
  languages: LanguageStats,
  theme: Theme,
  width: number = 400,
  height: number = 250
): string {
  const padding = 20;
  const barHeight = 20;
  const barSpacing = 30;

  // Calculate percentages
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  const languagePercentages = Object.entries(languages)
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: (bytes / total) * 100,
      color: LANGUAGE_COLORS[lang] || theme.colors.accent,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5); // Top 5 languages

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
      Top Languages
    </text>
  `;

  languagePercentages.forEach((lang, index) => {
    const y = 60 + index * barSpacing;
    const barWidth = ((width - padding * 2) * lang.percentage) / 100;

    content += `
      <g>
        <!-- Language name -->
        <text
          x="${padding}"
          y="${y}"
          font-family="${theme.fonts.primary}"
          font-size="12"
          fill="${theme.colors.text}"
        >
          ${escapeXml(lang.name)}
        </text>

        <!-- Percentage -->
        <text
          x="${width - padding}"
          y="${y}"
          font-family="${theme.fonts.mono}"
          font-size="11"
          fill="${theme.colors.textSecondary}"
          text-anchor="end"
        >
          ${lang.percentage.toFixed(1)}%
        </text>

        <!-- Progress bar background -->
        <rect
          x="${padding}"
          y="${y + 5}"
          width="${width - padding * 2}"
          height="${barHeight}"
          fill="${theme.colors.border}"
          rx="4"
        />

        <!-- Progress bar fill -->
        <rect
          x="${padding}"
          y="${y + 5}"
          width="${barWidth}"
          height="${barHeight}"
          fill="${lang.color}"
          rx="4"
        >
          <animate
            attributeName="width"
            from="0"
            to="${barWidth}"
            dur="0.8s"
            fill="freeze"
          />
        </rect>
      </g>
    `;
  });

  return content;
}
