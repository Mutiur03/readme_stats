import type { Theme } from "../themes";
import type { LanguageStats } from "../../github/types";
import { escapeXml } from "../builder";

const TECH_ICONS: Record<string, string> = {
  JavaScript: "JS",
  TypeScript: "TS",
  Python: "🐍",
  Java: "☕",
  Go: "🐹",
  Rust: "🦀",
  Ruby: "💎",
  PHP: "🐘",
  Swift: "🍎",
  Kotlin: "K",
  React: "⚛️",
  Vue: "V",
  Angular: "A",
  Node: "📗",
  Docker: "🐳",
  Git: "📚",
};

export function generateSkillsCard(
  languages: LanguageStats,
  theme: Theme,
  width: number = 400,
  height: number = 200
): string {
  const padding = 20;
  const iconSize = 50;
  const iconSpacing = 70;
  const iconsPerRow = 5;

  const skills = Object.keys(languages)
    .slice(0, 10)
    .map((lang) => ({
      name: lang,
      icon: TECH_ICONS[lang] || lang.substring(0, 2).toUpperCase(),
    }));

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
      Skills & Technologies
    </text>

    <!-- Skills Grid -->
  `;

  skills.forEach((skill, index) => {
    const col = index % iconsPerRow;
    const row = Math.floor(index / iconsPerRow);
    const x = padding + col * iconSpacing;
    const y = 70 + row * iconSpacing;

    content += `
      <g>
        <!-- Icon background -->
        <rect
          x="${x}"
          y="${y}"
          width="${iconSize}"
          height="${iconSize}"
          fill="${theme.colors.border}"
          rx="8"
          opacity="0.3"
        />

        <!-- Icon text -->
        <text
          x="${x + iconSize / 2}"
          y="${y + iconSize / 2 + 6}"
          font-family="${theme.fonts.primary}"
          font-size="18"
          font-weight="600"
          fill="${theme.colors.primary}"
          text-anchor="middle"
        >
          ${escapeXml(skill.icon)}
        </text>
      </g>
    `;
  });

  return content;
}
