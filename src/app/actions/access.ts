"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAccessToken,
  getAccessCookieName,
  getAccessMaxAge,
  isAccessGateEnabled,
  safeRedirectPath,
  verifyAccessCode,
} from "@/lib/access/session";

export async function unlockAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  if (!isAccessGateEnabled()) {
    redirect("/");
  }

  const code = String(formData.get("code") ?? "");
  const nextPath = safeRedirectPath(String(formData.get("next") ?? "/"));

  if (!verifyAccessCode(code)) {
    return { error: "รหัสเข้าใช้งานไม่ถูกต้อง" };
  }

  const token = await createAccessToken();
  if (!token) {
    return { error: "ไม่สามารถสร้างเซสชันได้" };
  }

  const cookieStore = await cookies();
  cookieStore.set(getAccessCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getAccessMaxAge(),
  });

  redirect(nextPath);
}
