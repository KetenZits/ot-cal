import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateOT } from "@/utils/otCalculator";
import { normalizeTime } from "@/utils/dateHelpers";
import { parseNumeric } from "@/utils/format";
import { getDayKind, type DayKind, type OTRecord } from "@/types/ot";
import type { Database } from "@/types/database";

type OTRecordRow = Database["public"]["Tables"]["ot_records"]["Row"];
type OTRecordRowLike = Omit<OTRecordRow, "day_kind"> & {
  day_kind?: string | null;
};

const MARKER_END_TIME = "00:00";
const DAY_KIND_MIGRATION_ERROR =
  "ยังไม่ได้เพิ่มคอลัมน์ประเภทวันในฐานข้อมูล กรุณารันไฟล์ supabase/migrations/003_goal_and_day_kind.sql ใน SQL Editor ของ Supabase";

function isMissingDayKindColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    msg.includes("day_kind") ||
    msg.includes("schema cache") ||
    msg.includes("could not find")
  );
}

function mapRecord(row: OTRecordRowLike): OTRecord {
  const dayKind: DayKind =
    row.day_kind === "off" || row.day_kind === "absent" ? row.day_kind : "ot";

  return {
    id: row.id,
    workDate: row.work_date,
    endTime: normalizeTime(row.end_time),
    otMinutes: row.ot_minutes,
    otAmount: parseNumeric(row.ot_amount),
    dayKind,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type UpsertInput = {
  workDate: string;
  endTime?: string;
  dayKind?: DayKind;
  hourlyRate: number;
  normalEndTime: string;
  note?: string | null;
};

type OTRecordInsert = Database["public"]["Tables"]["ot_records"]["Insert"];

function buildUpsertPayload(input: UpsertInput): OTRecordInsert {
  const dayKind = input.dayKind ?? "ot";
  const note = input.note ?? null;

  if (dayKind !== "ot") {
    return {
      work_date: input.workDate,
      end_time: MARKER_END_TIME,
      ot_minutes: 0,
      ot_amount: "0.00",
      note,
      day_kind: dayKind,
    };
  }

  const { otMinutes, otAmount } = calculateOT({
    normalEndTime: input.normalEndTime,
    actualEndTime: input.endTime ?? input.normalEndTime,
    hourlyRate: input.hourlyRate,
  });

  return {
    work_date: input.workDate,
    end_time: input.endTime ?? input.normalEndTime,
    ot_minutes: otMinutes,
    ot_amount: otAmount.toFixed(2),
    note,
    day_kind: "ot",
  };
}

export async function createOTRecord(input: UpsertInput): Promise<OTRecord> {
  return upsertOTRecord(input);
}

export async function getOTRecordByDate(workDate: string): Promise<OTRecord | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .select("*")
    .eq("work_date", workDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRecord(data) : null;
}

export async function getOTRecordsByDateRange(
  startDate: string,
  endDate: string,
): Promise<OTRecord[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .select("*")
    .gte("work_date", startDate)
    .lte("work_date", endDate)
    .order("work_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRecord);
}

export async function getAllOTRecords(): Promise<OTRecord[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .select("*")
    .order("work_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapRecord);
}

export async function updateOTRecord(input: UpsertInput): Promise<OTRecord> {
  return upsertOTRecord(input);
}

export async function upsertOTRecord(input: UpsertInput): Promise<OTRecord> {
  const payload = buildUpsertPayload(input);
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .upsert(payload, { onConflict: "work_date" })
    .select()
    .single();

  if (error && isMissingDayKindColumn(error)) {
    if (getDayKind({ dayKind: input.dayKind ?? "ot" }) !== "ot") {
      throw new Error(DAY_KIND_MIGRATION_ERROR);
    }

    const { day_kind: _dayKind, ...withoutKind } = payload;
    const fallback = await supabase
      .from("ot_records")
      .upsert(withoutKind, { onConflict: "work_date" })
      .select()
      .single();

    if (fallback.error || !fallback.data) {
      throw new Error(fallback.error?.message ?? "Failed to save OT record");
    }

    return mapRecord(fallback.data);
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save OT record");
  }

  return mapRecord(data);
}

export async function deleteOTRecord(workDate: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("ot_records")
    .delete()
    .eq("work_date", workDate);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAllOTRecords(): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("ot_records").delete().not("id", "is", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function replaceAllOTRecords(
  records: Array<{
    workDate: string;
    endTime: string;
    otMinutes: number;
    otAmount: number;
    dayKind?: DayKind;
    note?: string | null;
  }>,
): Promise<void> {
  await deleteAllOTRecords();

  if (records.length === 0) {
    return;
  }

  const supabase = createServerSupabaseClient();
  const rows = records.map((record) => ({
    work_date: record.workDate,
    end_time: record.endTime,
    ot_minutes: record.otMinutes,
    ot_amount: record.otAmount.toFixed(2),
    note: record.note ?? null,
    day_kind: record.dayKind === "off" || record.dayKind === "absent" ? record.dayKind : "ot",
  }));

  const { error } = await supabase.from("ot_records").insert(rows);

  if (error && isMissingDayKindColumn(error)) {
    const needsKind = rows.some((row) => row.day_kind !== "ot");
    if (needsKind) {
      throw new Error(DAY_KIND_MIGRATION_ERROR);
    }

    const fallback = await supabase.from("ot_records").insert(
      rows.map(({ day_kind: _dayKind, ...row }) => row),
    );
    if (fallback.error) {
      throw new Error(fallback.error.message);
    }
    return;
  }

  if (error) {
    throw new Error(error.message);
  }
}
