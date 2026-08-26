"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useClientEnvironment";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) {
    return null;
  }

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-[#78350f] px-3 py-2 text-center text-sm text-[#fde68a]"
    >
      <WifiOff size={16} aria-hidden="true" />
      ออฟไลน์อยู่ — คำนวณ OT ได้ แต่ยังบันทึกลงฐานข้อมูลไม่ได้
    </div>
  );
}
