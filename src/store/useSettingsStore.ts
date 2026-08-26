import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  hourlyRate: number;
  normalEndTime: string;
  loaded: boolean;
  hydrate: (settings: { hourlyRate: number; normalEndTime: string }) => void;
  setLocal: (patch: Partial<Pick<SettingsState, "hourlyRate" | "normalEndTime">>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hourlyRate: 75,
      normalEndTime: "17:00",
      loaded: false,
      hydrate: (settings) => set({ ...settings, loaded: true }),
      setLocal: (patch) => set(patch),
    }),
    {
      name: "ot-settings",
      partialize: (state) => ({
        hourlyRate: state.hourlyRate,
        normalEndTime: state.normalEndTime,
      }),
    },
  ),
);
