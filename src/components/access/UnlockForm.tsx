"use client";

import { useActionState } from "react";
import { unlockAction } from "@/app/actions/access";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LogoMark } from "@/components/ui/PageHeader";

export function UnlockForm({ nextPath }: { nextPath: string }) {
  const [state, action, pending] = useActionState(unlockAction, null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div>
          <h1 className="text-2xl font-semibold">OT Calculator</h1>
          <p className="text-sm text-[color-mix(in_srgb,var(--on-background)_75%,transparent)]">
            กรอกรหัสเพื่อเข้าใช้งาน
          </p>
        </div>
      </div>
      <Card className="p-5">
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={nextPath} />
          <Input
            type="password"
            name="code"
            autoComplete="current-password"
            label="รหัสเข้าใช้งาน"
            required
          />
          {state?.error ? (
            <p className="text-sm text-[#ef4444]" role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "กำลังตรวจสอบ..." : "เข้าใช้งาน"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
