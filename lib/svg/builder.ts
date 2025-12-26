import type { Theme } from "./themes";

export interface SVGBuilderOptions {
  width: number;
  height: number;
  theme: Theme;
}

export class SVGBuilder {
  private elements: string[] = [];
  private defs: string[] = [];
  private options: SVGBuilderOptions;

  constructor(options: SVGBuilderOptions) {
    this.options = options;
  }

  addDef(def: string): this {
    this.defs.push(def);
    return this;
  }

  addElement(element: string): this {
    this.elements.push(element);
    return this;
  }

  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    attrs?: Record<string, string | number>
  ): this {
    const attributes = this.formatAttributes({
      x,
      y,
      width,
      height,
      ...attrs,
    });
    this.elements.push(`<rect ${attributes} />`);
    return this;
  }

  text(
    x: number,
    y: number,
    content: string,
    attrs?: Record<string, string | number>
  ): this {
    const attributes = this.formatAttributes({ x, y, ...attrs });
    const escapedContent = this.escapeXml(content);
    this.elements.push(`<text ${attributes}>${escapedContent}</text>`);
    return this;
  }

  circle(
    cx: number,
    cy: number,
    r: number,
    attrs?: Record<string, string | number>
  ): this {
    const attributes = this.formatAttributes({ cx, cy, r, ...attrs });
    this.elements.push(`<circle ${attributes} />`);
    return this;
  }

  path(d: string, attrs?: Record<string, string | number>): this {
    const attributes = this.formatAttributes({ d, ...attrs });
    this.elements.push(`<path ${attributes} />`);
    return this;
  }

  group(content: string, attrs?: Record<string, string | number>): this {
    const attributes = attrs ? ` ${this.formatAttributes(attrs)}` : "";
    this.elements.push(`<g${attributes}>${content}</g>`);
    return this;
  }

  linearGradient(
    id: string,
    stops: Array<{ offset: string; color: string }>
  ): this {
    const stopElements = stops
      .map(
        (stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}" />`
      )
      .join("");
    this.defs.push(
      `<linearGradient id="${id}">${stopElements}</linearGradient>`
    );
    return this;
  }

  private formatAttributes(attrs: Record<string, string | number>): string {
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
  }

  private escapeXml(text: string): string {
    return escapeXml(text);
  }

  build(): string {
    const { width, height, theme } = this.options;

    const defsSection =
      this.defs.length > 0 ? `<defs>${this.defs.join("")}</defs>` : "";

    return `
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>GitHub Stats</title>
        ${defsSection}
        ${theme.backgroundPattern || ""}
        ${this.elements.join("\n")}
      </svg>
    `.trim();
  }
}

export function createCard(
  width: number,
  height: number,
  theme: Theme,
  content: string
): string {
  const builder = new SVGBuilder({ width, height, theme });

  // Add background
  builder.rect(0, 0, width, height, {
    fill: theme.colors.background,
    rx: theme.borderRadius,
    stroke: theme.colors.border,
    "stroke-width": 1,
    style: `filter: drop-shadow(${theme.shadow})`,
  });

  // Add content
  builder.addElement(content);

  return builder.build();
}

export function calculateRank(stats: {
  totalCommits: number;
  totalStars: number;
  totalPRs: number;
  totalIssues: number;
  followers: number;
  contributedTo: number;
}): string {
  const COMMITS_WEIGHT = 2;
  const STARS_WEIGHT = 10;
  const PRS_WEIGHT = 15;
  const ISSUES_WEIGHT = 5;
  const FOLLOWERS_WEIGHT = 1;
  const CONTRIB_WEIGHT = 5;

  const score =
    stats.totalCommits * COMMITS_WEIGHT +
    stats.totalStars * STARS_WEIGHT +
    stats.totalPRs * PRS_WEIGHT +
    stats.totalIssues * ISSUES_WEIGHT +
    stats.followers * FOLLOWERS_WEIGHT +
    stats.contributedTo * CONTRIB_WEIGHT;

  // Based on manual mapping of reference image (657 commits, 1 star, 18 PRs, 16 contribs = A+)
  // Score = 657*2 + 1*10 + 18*15 + 0*5 + (some followers)*1 + 16*5 = 1314 + 10 + 270 + 80 = 1674

  if (score >= 2500) return "S";
  if (score >= 1500) return "A+";
  if (score >= 1000) return "A";
  if (score >= 600) return "B+";
  if (score >= 300) return "B";
  if (score >= 100) return "C";
  return "D";
}

export function formatNumber(num?: number | null): string {
  if (num === undefined || num === null || Number.isNaN(Number(num))) {
    return "0";
  }

  const n = Number(num);

  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + "M";
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "K";
  }
  return n.toString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
