"use client";

import { Share } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/store/useUIStore";
import { useIosSafari, useStandaloneDisplay } from "@/hooks/useClientEnvironment";

export function InstallSection() {
  const installPromptEvent = useUIStore((state) => state.installPromptEvent);
  const setInstallPromptEvent = useUIStore((state) => state.setInstallPromptEvent);
  const ios = useIosSafari();
  const standalone = useStandaloneDisplay();

  async function install() {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  }

  return (
    <Card>
      <h2 className="mb-2 text-lg font-semibold">Install App</h2>
      {standalone ? (
        <p className="text-sm text-[var(--text-muted)]">แอปทำงานในโหมดเต็มจอแล้ว</p>
      ) : installPromptEvent ? (
        <Button onClick={() => void install()}>Install App</Button>
      ) : ios ? (
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--text-muted)]">
          <li className="flex items-center gap-1">
            กด Share <Share size={14} aria-hidden="true" />
          </li>
          <li>เลือก &quot;Add to Home Screen&quot;</li>
          <li>กด Add</li>
        </ol>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          ใช้เมนูของเบราว์เซอร์เพื่อติดตั้งแอป หากเบราว์เซอร์รองรับ
        </p>
      )}
    </Card>
  );
}
