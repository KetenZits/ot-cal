"use client";

import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUIStore } from "@/store/useUIStore";
import { useIosSafari, useStandaloneDisplay } from "@/hooks/useClientEnvironment";

export function InstallPrompt() {
  const installPromptEvent = useUIStore((state) => state.installPromptEvent);
  const setInstallPromptEvent = useUIStore((state) => state.setInstallPromptEvent);
  const ios = useIosSafari();
  const standalone = useStandaloneDisplay();
  const [dismissed, setDismissed] = useState(false);

  const showIos = ios && !standalone && !dismissed;
  const showBrowser = Boolean(installPromptEvent) && !dismissed;
  if (!showIos && !showBrowser) {
    return null;
  }

  async function install() {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
    setDismissed(true);
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 mx-auto w-full max-w-lg px-4 md:bottom-6">
      <Card className="shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">Install App</p>
            {showIos ? (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--text-muted)]">
                <li className="flex items-center gap-1">
                  กด Share <Share size={14} aria-hidden="true" />
                </li>
                <li>เลือก &quot;Add to Home Screen&quot;</li>
                <li>กด Add</li>
              </ol>
            ) : (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                ติดตั้งแอปไว้บนหน้าจอหลักเพื่อใช้งานแบบเต็มจอ
              </p>
            )}
          </div>
          <button
            type="button"
            className="text-sm text-[var(--text-muted)]"
            onClick={() => setDismissed(true)}
          >
            ปิด
          </button>
        </div>
        {showBrowser ? (
          <Button className="mt-3 w-full" onClick={() => void install()}>
            Install App
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
