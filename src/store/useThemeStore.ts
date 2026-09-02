import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedTheme, ThemeConfig } from "@/types/theme";
import { DEFAULT_THEME, getPresetById } from "@/theme/presets";
import {
  DEFAULT_UI_STYLE_ID,
  isUiStyleId,
  type UiStyleId,
} from "@/theme/uiStyles";

function withUiStyle(config: ThemeConfig, uiStyleId?: string): ThemeConfig {
  return {
    ...config,
    uiStyleId: isUiStyleId(uiStyleId) ? uiStyleId : (config.uiStyleId ?? DEFAULT_UI_STYLE_ID),
  };
}

interface ThemeState {
  config: ThemeConfig;
  savedThemes: SavedTheme[];
  setConfig: (config: ThemeConfig) => void;
  applyPreset: (presetId: string) => void;
  applyUiStyle: (uiStyleId: UiStyleId) => void;
  setSavedThemes: (themes: SavedTheme[]) => void;
  addSavedTheme: (theme: SavedTheme) => void;
  removeSavedTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      config: withUiStyle(DEFAULT_THEME, DEFAULT_UI_STYLE_ID),
      savedThemes: [],
      setConfig: (config) => set({ config: withUiStyle(config, config.uiStyleId) }),
      applyPreset: (presetId) => {
        const preset = getPresetById(presetId);
        if (preset) {
          set((state) => ({
            config: withUiStyle(preset.config, state.config.uiStyleId),
          }));
        }
      },
      applyUiStyle: (uiStyleId) => {
        set((state) => ({
          config: withUiStyle(state.config, uiStyleId),
        }));
      },
      setSavedThemes: (savedThemes) => set({ savedThemes }),
      addSavedTheme: (theme) =>
        set((state) => ({ savedThemes: [theme, ...state.savedThemes] })),
      removeSavedTheme: (id) =>
        set((state) => ({
          savedThemes: state.savedThemes.filter((theme) => theme.id !== id),
        })),
    }),
    {
      name: "ot-theme",
      version: 5,
      partialize: (state) => ({ config: state.config }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as { config?: ThemeConfig };
        const config = state.config;
        const uiStyleId = isUiStyleId(config?.uiStyleId) ? config.uiStyleId : DEFAULT_UI_STYLE_ID;
        if (config?.mode === "preset" && config.presetId) {
          const preset = getPresetById(config.presetId);
          if (preset) {
            return { config: withUiStyle(preset.config, uiStyleId) };
          }
        }
        if (config?.colors) {
          return { config: withUiStyle(config, uiStyleId) };
        }
        return { config: withUiStyle(DEFAULT_THEME, uiStyleId) };
      },
    },
  ),
);
