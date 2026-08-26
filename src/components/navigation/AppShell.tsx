"use client";

import { useEffect } from "react";
import { BottomNav, SideNav } from "./AppNav";
import { PageTransition } from "./PageTransition";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { useUIStore } from "@/store/useUIStore";
import { getSettingsAction } from "@/app/actions/settings";
import { getSavedThemesAction } from "@/app/actions/themes";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useThemeStore } from "@/store/useThemeStore";
import type { BeforeInstallPromptEvent } from "@/types/pwa";

export function AppShell({ children }: { children: React.ReactNode }) {
  const showToast = useUIStore((state) => state.showToast);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const setSavedThemes = useThemeStore((state) => state.setSavedThemes);
  const setInstallPromptEvent = useUIStore((state) => state.setInstallPromptEvent);

  useEffect(() => {
    const onInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onInstallPrompt);
  }, [setInstallPromptEvent]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const [settingsResult, themesResult] = await Promise.all([
        getSettingsAction(),
        getSavedThemesAction(),
      ]);
      if (cancelled) return;

      if (settingsResult.ok) {
        hydrateSettings(settingsResult.data);
      } else {
        showToast(settingsResult.error, "error");
      }

      if (themesResult.ok) {
        setSavedThemes(themesResult.data);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [hydrateSettings, setSavedThemes, showToast]);

  return (
    <div className="min-h-dvh max-w-full overflow-x-hidden bg-[var(--background)] text-[var(--on-background)]">
      <OfflineBanner />
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
        <SideNav />
        <main className="relative min-w-0 flex-1 overflow-x-hidden px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:pb-8 md:pt-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
      <ToastViewport />
      <InstallPrompt />
    </div>
  );
}
