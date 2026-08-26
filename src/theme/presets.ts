import type { ThemeConfig } from "@/types/theme";

export interface ThemePreset {
  id: string;
  name: string;
  config: ThemeConfig;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "vivid",
    name: "Vivid",
    config: {
      mode: "preset",
      presetId: "vivid",
      colors: {
        background: "#5B4BFF",
        surface: "#FFFFFF",
        primary: "#1C1C28",
        accent: "#FF6B57",
        text: "#1C1C28",
        textMuted: "#7B8194",
      },
    },
  },
  {
    id: "black-white",
    name: "Black & White",
    config: {
      mode: "preset",
      presetId: "black-white",
      colors: {
        background: "#000000",
        surface: "#111111",
        primary: "#FFFFFF",
        accent: "#FFFFFF",
        text: "#FFFFFF",
        textMuted: "#A1A1AA",
      },
    },
  },
  {
    id: "blue",
    name: "Blue",
    config: {
      mode: "preset",
      presetId: "blue",
      colors: {
        background: "#0B1220",
        surface: "#111827",
        primary: "#E0F2FE",
        accent: "#38BDF8",
        text: "#F8FAFC",
        textMuted: "#94A3B8",
      },
    },
  },
  {
    id: "purple",
    name: "Purple",
    config: {
      mode: "preset",
      presetId: "purple",
      colors: {
        background: "#2A1650",
        surface: "#FFFFFF",
        primary: "#1C1C28",
        accent: "#A855F7",
        text: "#1C1C28",
        textMuted: "#7B8194",
      },
    },
  },
  {
    id: "amber",
    name: "Warm / Amber",
    config: {
      mode: "preset",
      presetId: "amber",
      colors: {
        background: "#140F0A",
        surface: "#1C1610",
        primary: "#FFF7ED",
        accent: "#F59E0B",
        text: "#FFFBEB",
        textMuted: "#D6C7B0",
      },
    },
  },
  {
    id: "light",
    name: "Light Mode",
    config: {
      mode: "preset",
      presetId: "light",
      colors: {
        background: "#F3F4F8",
        surface: "#FFFFFF",
        primary: "#0F172A",
        accent: "#FF6B57",
        text: "#0F172A",
        textMuted: "#64748B",
      },
    },
  },
];

export const DEFAULT_THEME = THEME_PRESETS[0].config;

export function getPresetById(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.id === id);
}

export const THEME_COLOR_KEYS = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Muted Text" },
] as const;
