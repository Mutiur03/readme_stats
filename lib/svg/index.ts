import type { GitHubStats } from "../github/types";
import type { SVGConfig } from "../github/types";
import { getTheme, applyCustomColors } from "./themes";
import { layoutCards } from "./layout";
import { generateProfileStatsCard } from "./cards/profile-stats";
import { generateRepositoriesCard } from "./cards/repositories";
import { generateCommitsCard } from "./cards/commits";
import { generateStreakCard } from "./cards/streak";
import { generateLanguagesCard } from "./cards/languages";
import { generateSkillsCard } from "./cards/skills";
import { generateTrophiesCard } from "./cards/trophies";
import { generateUnifiedCard } from "./cards/unified";

export function generateStatsSVG(
  stats: GitHubStats,
  config: SVGConfig
): string {
  let theme = getTheme(config.theme);
  theme = applyCustomColors(theme, {
    primary: config.primaryColor,
    secondary: config.secondaryColor,
    background: config.backgroundColor,
  });

  if (config.fontFamily) {
    theme.fonts.primary = config.fontFamily;
  }
  if (config.borderRadius !== undefined) {
    theme.borderRadius = config.borderRadius;
  }

  const cardDimensions = {
    width: 450,
    height: 200,
  };

  const cards: string[] = [];

  config.cards.forEach((cardType) => {
    switch (cardType) {
      case "profile":
        cards.push(
          generateProfileStatsCard(
            stats.user,
            theme,
            cardDimensions.width,
            cardDimensions.height
          )
        );
        break;
      case "repositories":
        cards.push(
          generateRepositoriesCard(
            stats.user.public_repos,
            stats.totalStars,
            stats.totalForks,
            theme,
            cardDimensions.width,
            cardDimensions.height
          )
        );
        break;
      case "commits":
        cards.push(
          generateCommitsCard(
            stats.totalCommits,
            theme,
            cardDimensions.width,
            cardDimensions.height
          )
        );
        break;
      case "streak":
        cards.push(
          generateStreakCard(
            stats.currentStreak,
            stats.longestStreak,
            stats.totalContributions,
            theme,
            cardDimensions.width,
            cardDimensions.height
          )
        );
        break;
      case "languages":
        if (Object.keys(stats.languages).length > 0) {
          cards.push(
            generateLanguagesCard(
              stats.languages,
              theme,
              cardDimensions.width,
              cardDimensions.height + 50
            )
          );
        }
        break;
      case "skills":
        if (Object.keys(stats.languages).length > 0) {
          cards.push(
            generateSkillsCard(
              stats.languages,
              theme,
              cardDimensions.width,
              cardDimensions.height
            )
          );
        }
        break;
      case "trophies":
        cards.push(
          generateTrophiesCard(
            stats,
            theme,
            cardDimensions.width,
            cardDimensions.height
          )
        );
        break;
      case "unified":
        cards.push(
          generateUnifiedCard(
            stats,
            theme,
            cardDimensions.width,
            cardDimensions.height
          )
        );
        break;
    }
  });

  const svg = layoutCards(
    cards,
    {
      type: config.layout,
      cardDimensions,
      spacing: 20,
      maxColumns: 2,
    },
    theme
  );

  return svg;
}

export * from "./themes";
export * from "./builder";
export * from "./layout";
