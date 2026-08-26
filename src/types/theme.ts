export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  textMuted: string;
}

export interface ThemeConfig {
  mode: "preset" | "custom";
  presetId?: string;
  colors: ThemeColors;
}

export interface SavedTheme {
  id: string;
  name: string;
  config: ThemeConfig;
  createdAt: string;
  updatedAt: string;
}
