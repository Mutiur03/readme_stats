export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
  fonts: {
    primary: string;
    mono: string;
  };
  borderRadius: number;
  shadow: string;
  backgroundPattern?: string;
}

export const themes: Record<string, Theme> = {
  dark: {
    name: "Dark",
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      background: "#0f172a",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      border: "#334155",
      accent: "#06b6d4",
    },
    fonts: {
      primary:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    borderRadius: 12,
    shadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
  },
  light: {
    name: "Light",
    colors: {
      primary: "#2563eb",
      secondary: "#7c3aed",
      background: "#ffffff",
      text: "#0f172a",
      textSecondary: "#64748b",
      border: "#e2e8f0",
      accent: "#0891b2",
    },
    fonts: {
      primary:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    borderRadius: 12,
    shadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  glass: {
    name: "Glass",
    colors: {
      primary: "#60a5fa",
      secondary: "#a78bfa",
      background: "rgba(15, 23, 42, 0.7)",
      text: "#f1f5f9",
      textSecondary: "#cbd5e1",
      border: "rgba(255, 255, 255, 0.1)",
      accent: "#22d3ee",
    },
    fonts: {
      primary:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    borderRadius: 16,
    shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    backgroundPattern: `
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>
    `,
  },
  neon: {
    name: "Neon",
    colors: {
      primary: "#ff00ff",
      secondary: "#00ffff",
      background: "#0a0a0a",
      text: "#ffffff",
      textSecondary: "#b4b4b4",
      border: "#ff00ff",
      accent: "#00ff00",
    },
    fonts: {
      primary: "'Orbitron', 'Rajdhani', sans-serif",
      mono: "'Share Tech Mono', monospace",
    },
    borderRadius: 8,
    shadow: "0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)",
  },
  github: {
    name: "GitHub",
    colors: {
      primary: "#238636",
      secondary: "#1f6feb",
      background: "#0d1117",
      text: "#c9d1d9",
      textSecondary: "#8b949e",
      border: "#30363d",
      accent: "#58a6ff",
    },
    fonts: {
      primary:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', sans-serif",
      mono: "'SF Mono', 'Consolas', monospace",
    },
    borderRadius: 6,
    shadow: "0 0 0 1px rgba(240, 246, 252, 0.1)",
  },
  cyberpunk: {
    name: "Cyberpunk",
    colors: {
      primary: "#fcee09",
      secondary: "#ff2a6d",
      background: "#05080d",
      text: "#d9e7f1",
      textSecondary: "#7ea8be",
      border: "#1a3a52",
      accent: "#01cdfe",
    },
    fonts: {
      primary: "'Rajdhani', 'Exo 2', sans-serif",
      mono: "'Share Tech Mono', monospace",
    },
    borderRadius: 4,
    shadow:
      "0 0 10px rgba(252, 238, 9, 0.3), 0 4px 20px rgba(1, 205, 254, 0.2)",
  },
};

export function getTheme(themeName: string): Theme {
  return themes[themeName] || themes.dark;
}

export function applyCustomColors(
  theme: Theme,
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
  }
): Theme {
  if (!customColors) return theme;

  return {
    ...theme,
    colors: {
      ...theme.colors,
      ...(customColors.primary && { primary: customColors.primary }),
      ...(customColors.secondary && { secondary: customColors.secondary }),
      ...(customColors.background && { background: customColors.background }),
    },
  };
}
