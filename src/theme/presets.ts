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
      uiStyleId: "modern",
      colors: {
        background: "#4F3DFF",
        surface: "#F5F3FF",
        primary: "#16161F",
        accent: "#FF5A45",
        text: "#16161F",
        textMuted: "#5C6378",
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
        background: "#09090B",
        surface: "#1C1C1F",
        primary: "#FAFAFA",
        accent: "#E4E4E7",
        text: "#FAFAFA",
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
        background: "#07111F",
        surface: "#152033",
        primary: "#E0F2FE",
        accent: "#38BDF8",
        text: "#F8FAFC",
        textMuted: "#93A4BB",
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
        background: "#3B1D73",
        surface: "#F6F2FF",
        primary: "#1A1228",
        accent: "#7C3AED",
        text: "#1A1228",
        textMuted: "#5E5770",
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
        background: "#1C140A",
        surface: "#2C2218",
        primary: "#FFF7ED",
        accent: "#F5A524",
        text: "#FFF8EB",
        textMuted: "#C9B89A",
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
        background: "#E8EBF2",
        surface: "#FFFFFF",
        primary: "#0F172A",
        accent: "#E11D48",
        text: "#0F172A",
        textMuted: "#475569",
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
