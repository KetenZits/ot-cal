"use server";

import type { ActionResult } from "@/types/actions";
import type { BackupPayload } from "@/lib/validation/schemas";
import { backupSchema } from "@/lib/validation/schemas";
import { getAllOTRecords, replaceAllOTRecords, deleteAllOTRecords } from "@/data/otRecords";
import { getSettings, resetSettings, updateSettings } from "@/data/settings";
import { deleteAllThemes, getSavedThemes, replaceAllThemes } from "@/data/themes";
import { buildBackupPayload } from "@/utils/exportImport";
import { failAction, requireAppAccess } from "@/lib/access/guard";

export async function exportDataAction(): Promise<ActionResult<BackupPayload>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  try {
    const [settings, otRecords, savedThemes] = await Promise.all([
      getSettings(),
      getAllOTRecords(),
      getSavedThemes(),
    ]);
    return { ok: true, data: buildBackupPayload(settings, otRecords, savedThemes) };
  } catch (error) {
    return failAction(error, "ไม่สามารถส่งออกข้อมูลได้");
  }
}

export async function importDataAction(
  input: unknown,
): Promise<ActionResult<{ imported: true }>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = backupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ไฟล์สำรองข้อมูลไม่ถูกต้อง" };
  }

  try {
    await updateSettings({
      hourlyRate: parsed.data.settings.hourlyRate,
      normalEndTime: parsed.data.settings.normalEndTime,
    });
    await replaceAllOTRecords(parsed.data.otRecords);
    await replaceAllThemes(parsed.data.savedThemes);
    return { ok: true, data: { imported: true } };
  } catch (error) {
    return failAction(error, "ไม่สามารถนำเข้าข้อมูลได้");
  }
}

export async function deleteAllDataAction(): Promise<ActionResult<{ deleted: true }>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  try {
    await deleteAllOTRecords();
    await deleteAllThemes();
    await resetSettings();
    return { ok: true, data: { deleted: true } };
  } catch (error) {
    return failAction(error, "ไม่สามารถลบข้อมูลทั้งหมดได้");
  }
}
