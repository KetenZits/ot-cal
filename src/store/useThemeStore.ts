import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedTheme, ThemeConfig } from "@/types/theme";
import { DEFAULT_THEME, getPresetById } from "@/theme/presets";

interface ThemeState {
  config: ThemeConfig;
  savedThemes: SavedTheme[];
  setConfig: (config: ThemeConfig) => void;
  applyPreset: (presetId: string) => void;
  setSavedThemes: (themes: SavedTheme[]) => void;
  addSavedTheme: (theme: SavedTheme) => void;
  removeSavedTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      config: DEFAULT_THEME,
      savedThemes: [],
      setConfig: (config) => set({ config }),
      applyPreset: (presetId) => {
        const preset = getPresetById(presetId);
        if (preset) {
          set({ config: preset.config });
        }
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
      version: 4,
      partialize: (state) => ({ config: state.config }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as { config?: ThemeConfig };
        const config = state.config;
        if (config?.mode === "preset" && config.presetId) {
          const preset = getPresetById(config.presetId);
          if (preset) {
            return { config: preset.config };
          }
        }
        if (config?.mode === "custom" && config.colors) {
          return { config };
        }
        return { config: DEFAULT_THEME };
      },
    },
  ),
);
