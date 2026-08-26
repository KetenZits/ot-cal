"use server";

import type { ActionResult } from "@/types/actions";
import type { AppSettings } from "@/types/settings";
import { settingsUpdateSchema } from "@/lib/validation/schemas";
import { getSettings, updateSettings } from "@/data/settings";
import { failAction, requireAppAccess } from "@/lib/access/guard";

export async function getSettingsAction(): Promise<ActionResult<AppSettings>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  try {
    const settings = await getSettings();
    return { ok: true, data: settings };
  } catch (error) {
    return failAction(error, "ไม่สามารถโหลดการตั้งค่าได้");
  }
}

export async function updateSettingsAction(
  input: unknown,
): Promise<ActionResult<AppSettings>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = settingsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const settings = await updateSettings(parsed.data);
    return { ok: true, data: settings };
  } catch (error) {
    return failAction(error, "ไม่สามารถบันทึกการตั้งค่าได้");
  }
}
