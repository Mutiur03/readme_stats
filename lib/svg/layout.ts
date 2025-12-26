import type { Theme } from "./themes";
import { SVGBuilder } from "./builder";

export type LayoutType = "grid" | "row" | "column";

export interface CardDimensions {
  width: number;
  height: number;
}

export interface LayoutConfig {
  type: LayoutType;
  cardDimensions: CardDimensions;
  spacing: number;
  maxColumns?: number;
}

export function calculateLayoutDimensions(
  cardCount: number,
  config: LayoutConfig
): { width: number; height: number } {
  const { type, cardDimensions, spacing, maxColumns = 2 } = config;

  switch (type) {
    case "grid": {
      const columns = Math.min(cardCount, maxColumns);
      const rows = Math.ceil(cardCount / columns);
      return {
        width: columns * cardDimensions.width + (columns - 1) * spacing,
        height: rows * cardDimensions.height + (rows - 1) * spacing,
      };
    }
    case "row": {
      return {
        width: cardCount * cardDimensions.width + (cardCount - 1) * spacing,
        height: cardDimensions.height,
      };
    }
    case "column": {
      return {
        width: cardDimensions.width,
        height: cardCount * cardDimensions.height + (cardCount - 1) * spacing,
      };
    }
  }
}

export function layoutCards(
  cards: string[],
  config: LayoutConfig,
  theme: Theme
): string {
  const { type, cardDimensions, spacing, maxColumns = 2 } = config;
  const totalDimensions = calculateLayoutDimensions(cards.length, config);

  const builder = new SVGBuilder({
    width: totalDimensions.width,
    height: totalDimensions.height,
    theme,
  });

  cards.forEach((card, index) => {
    let x = 0;
    let y = 0;

    switch (type) {
      case "grid": {
        const col = index % maxColumns;
        const row = Math.floor(index / maxColumns);
        x = col * (cardDimensions.width + spacing);
        y = row * (cardDimensions.height + spacing);
        break;
      }
      case "row": {
        x = index * (cardDimensions.width + spacing);
        y = 0;
        break;
      }
      case "column": {
        x = 0;
        y = index * (cardDimensions.height + spacing);
        break;
      }
    }

    builder.group(card, {
      transform: `translate(${x}, ${y})`,
    });
  });

  return builder.build();
}
