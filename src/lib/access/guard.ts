import "server-only";

import { cookies } from "next/headers";
import type { ActionResult } from "@/types/actions";
import {
  getAccessCookieName,
  isAccessGateEnabled,
  isValidAccessToken,
} from "@/lib/access/session";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function requireAppAccess(): Promise<ActionResult<never> | null> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "ยังไม่ได้ตั้งค่า Supabase ใน environment variables",
    };
  }

  if (!isAccessGateEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAccessCookieName())?.value;
  if (!(await isValidAccessToken(token))) {
    return { ok: false, error: "กรุณาใส่รหัสเข้าใช้งาน" };
  }

  return null;
}

export function failAction(error: unknown, fallback: string): ActionResult<never> {
  console.error(error);
  return { ok: false, error: fallback };
}
