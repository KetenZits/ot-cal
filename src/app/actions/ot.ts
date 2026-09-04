"use server";

import { z } from "zod";
import type { ActionResult } from "@/types/actions";
import type { OTRecord } from "@/types/ot";
import { otUpsertSchema, dateKeySchema } from "@/lib/validation/schemas";
import {
  deleteOTRecord,
  getOTRecordByDate,
  getOTRecordsByDateRange,
  upsertOTRecord,
} from "@/data/otRecords";
import { getSettings } from "@/data/settings";
import { failAction, requireAppAccess } from "@/lib/access/guard";

const rangeSchema = z.object({
  startDate: dateKeySchema,
  endDate: dateKeySchema,
});

export async function getOTRecordsByDateRangeAction(
  startDate: string,
  endDate: string,
): Promise<ActionResult<OTRecord[]>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = rangeSchema.safeParse({ startDate, endDate });
  if (!parsed.success) {
    return { ok: false, error: "ช่วงวันที่ไม่ถูกต้อง" };
  }

  try {
    const records = await getOTRecordsByDateRange(
      parsed.data.startDate,
      parsed.data.endDate,
    );
    return { ok: true, data: records };
  } catch (error) {
    return failAction(error, "ไม่สามารถโหลดข้อมูลได้");
  }
}

export async function getOTRecordByDateAction(
  workDate: string,
): Promise<ActionResult<OTRecord | null>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = dateKeySchema.safeParse(workDate);
  if (!parsed.success) {
    return { ok: false, error: "วันที่ไม่ถูกต้อง" };
  }

  try {
    const record = await getOTRecordByDate(parsed.data);
    return { ok: true, data: record };
  } catch (error) {
    return failAction(error, "ไม่สามารถโหลดข้อมูลได้");
  }
}

export async function saveOTRecordAction(input: unknown): Promise<ActionResult<OTRecord>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = otUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const settings = await getSettings();
    const record = await upsertOTRecord({
      workDate: parsed.data.workDate,
      endTime: parsed.data.endTime,
      dayKind: parsed.data.dayKind,
      note: parsed.data.note,
      hourlyRate: settings.hourlyRate,
      normalEndTime: settings.normalEndTime,
    });
    return { ok: true, data: record };
  } catch (error) {
    return failAction(error, "ไม่สามารถบันทึกข้อมูลได้");
  }
}

export async function deleteOTRecordAction(
  workDate: string,
): Promise<ActionResult<{ workDate: string }>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = dateKeySchema.safeParse(workDate);
  if (!parsed.success) {
    return { ok: false, error: "วันที่ไม่ถูกต้อง" };
  }

  try {
    await deleteOTRecord(parsed.data);
    return { ok: true, data: { workDate: parsed.data } };
  } catch (error) {
    return failAction(error, "ไม่สามารถลบรายการได้");
  }
}
