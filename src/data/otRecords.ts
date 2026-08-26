import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateOT } from "@/utils/otCalculator";
import { normalizeTime } from "@/utils/dateHelpers";
import { parseNumeric } from "@/utils/format";
import type { OTRecord } from "@/types/ot";
import type { Database } from "@/types/database";

type OTRecordRow = Database["public"]["Tables"]["ot_records"]["Row"];

function mapRecord(row: OTRecordRow): OTRecord {
  return {
    id: row.id,
    workDate: row.work_date,
    endTime: normalizeTime(row.end_time),
    otMinutes: row.ot_minutes,
    otAmount: parseNumeric(row.ot_amount),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createOTRecord(input: {
  workDate: string;
  endTime: string;
  hourlyRate: number;
  normalEndTime: string;
  note?: string | null;
}): Promise<OTRecord> {
  const { otMinutes, otAmount } = calculateOT({
    normalEndTime: input.normalEndTime,
    actualEndTime: input.endTime,
    hourlyRate: input.hourlyRate,
  });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .insert({
      work_date: input.workDate,
      end_time: input.endTime,
      ot_minutes: otMinutes,
      ot_amount: otAmount.toFixed(2),
      note: input.note ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create OT record");
  }

  return mapRecord(data);
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

export async function updateOTRecord(input: {
  workDate: string;
  endTime: string;
  hourlyRate: number;
  normalEndTime: string;
  note?: string | null;
}): Promise<OTRecord> {
  const { otMinutes, otAmount } = calculateOT({
    normalEndTime: input.normalEndTime,
    actualEndTime: input.endTime,
    hourlyRate: input.hourlyRate,
  });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .update({
      end_time: input.endTime,
      ot_minutes: otMinutes,
      ot_amount: otAmount.toFixed(2),
      note: input.note ?? null,
    })
    .eq("work_date", input.workDate)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update OT record");
  }

  return mapRecord(data);
}

export async function upsertOTRecord(input: {
  workDate: string;
  endTime: string;
  hourlyRate: number;
  normalEndTime: string;
  note?: string | null;
}): Promise<OTRecord> {
  const { otMinutes, otAmount } = calculateOT({
    normalEndTime: input.normalEndTime,
    actualEndTime: input.endTime,
    hourlyRate: input.hourlyRate,
  });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ot_records")
    .upsert(
      {
        work_date: input.workDate,
        end_time: input.endTime,
        ot_minutes: otMinutes,
        ot_amount: otAmount.toFixed(2),
        note: input.note ?? null,
      },
      { onConflict: "work_date" },
    )
    .select()
    .single();

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
    note?: string | null;
  }>,
): Promise<void> {
  await deleteAllOTRecords();

  if (records.length === 0) {
    return;
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("ot_records").insert(
    records.map((record) => ({
      work_date: record.workDate,
      end_time: record.endTime,
      ot_minutes: record.otMinutes,
      ot_amount: record.otAmount.toFixed(2),
      note: record.note ?? null,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}
