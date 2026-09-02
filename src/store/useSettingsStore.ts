import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  hourlyRate: number;
  normalEndTime: string;
  periodStartDay: number;
  periodEndDay: number;
  loaded: boolean;
  hydrate: (settings: {
    hourlyRate: number;
    normalEndTime: string;
    periodStartDay?: number;
    periodEndDay?: number;
  }) => void;
  setLocal: (
    patch: Partial<
      Pick<SettingsState, "hourlyRate" | "normalEndTime" | "periodStartDay" | "periodEndDay">
    >,
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hourlyRate: 75,
      normalEndTime: "17:00",
      periodStartDay: 26,
      periodEndDay: 26,
      loaded: false,
      hydrate: (settings) =>
        set({
          hourlyRate: settings.hourlyRate,
          normalEndTime: settings.normalEndTime,
          periodStartDay: settings.periodStartDay ?? 26,
          periodEndDay: settings.periodEndDay ?? 26,
          loaded: true,
        }),
      setLocal: (patch) => set(patch),
    }),
    {
      name: "ot-settings",
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<SettingsState>;
        return {
          hourlyRate: state.hourlyRate ?? 75,
          normalEndTime: state.normalEndTime ?? "17:00",
          periodStartDay: state.periodStartDay ?? 26,
          periodEndDay: state.periodEndDay ?? 26,
        };
      },
      partialize: (state) => ({
        hourlyRate: state.hourlyRate,
        normalEndTime: state.normalEndTime,
        periodStartDay: state.periodStartDay,
        periodEndDay: state.periodEndDay,
      }),
    },
  ),
);
