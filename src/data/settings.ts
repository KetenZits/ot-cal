import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeTime } from "@/utils/dateHelpers";
import { parseNumeric } from "@/utils/format";
import type { AppSettings, SettingsUpdate } from "@/types/settings";
import type { Database } from "@/types/database";

type SettingsRow = Database["public"]["Tables"]["app_settings"]["Row"];
type SettingsRowLike = Omit<
  SettingsRow,
  "period_start_day" | "period_end_day" | "cycle_goal_amount"
> & {
  period_start_day?: number | null;
  period_end_day?: number | null;
  cycle_goal_amount?: string | number | null;
};

const DEFAULT_SETTINGS = {
  id: 1 as const,
  hourlyRate: 75,
  normalEndTime: "17:00",
  periodStartDay: 26,
  periodEndDay: 26,
  cycleGoalAmount: 0,
};

const GOAL_MIGRATION_ERROR =
  "ยังไม่ได้เพิ่มคอลัมน์เป้าหมายรอบในฐานข้อมูล กรุณารันไฟล์ supabase/migrations/003_goal_and_day_kind.sql ใน SQL Editor ของ Supabase";

function clampDay(value: number | null | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(Number(value))) return fallback;
  return Math.min(31, Math.max(1, Math.trunc(Number(value))));
}

function mapSettings(row: SettingsRowLike): AppSettings {
  return {
    id: 1,
    hourlyRate: parseNumeric(row.hourly_rate),
    normalEndTime: normalizeTime(row.normal_end_time),
    periodStartDay: clampDay(row.period_start_day, DEFAULT_SETTINGS.periodStartDay),
    periodEndDay: clampDay(row.period_end_day, DEFAULT_SETTINGS.periodEndDay),
    cycleGoalAmount: parseNumeric(row.cycle_goal_amount ?? 0),
    updatedAt: row.updated_at,
  };
}

function isMissingColumn(
  error: { message?: string; code?: string } | null,
  names: string[],
): boolean {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    names.some((name) => msg.includes(name)) ||
    msg.includes("schema cache") ||
    msg.includes("could not find")
  );
}

export async function getSettings(): Promise<AppSettings> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const { data: created, error: insertError } = await supabase
      .from("app_settings")
      .insert({
        id: 1,
        hourly_rate: DEFAULT_SETTINGS.hourlyRate,
        normal_end_time: DEFAULT_SETTINGS.normalEndTime,
        period_start_day: DEFAULT_SETTINGS.periodStartDay,
        period_end_day: DEFAULT_SETTINGS.periodEndDay,
        cycle_goal_amount: DEFAULT_SETTINGS.cycleGoalAmount.toFixed(2),
      })
      .select()
      .single();

    if (insertError && isMissingColumn(insertError, [
      "period_start_day",
      "period_end_day",
      "cycle_goal_amount",
    ])) {
      const { data: fallback, error: fallbackError } = await supabase
        .from("app_settings")
        .insert({
          id: 1,
          hourly_rate: DEFAULT_SETTINGS.hourlyRate,
          normal_end_time: DEFAULT_SETTINGS.normalEndTime,
        })
        .select()
        .single();

      if (fallbackError || !fallback) {
        throw new Error(fallbackError?.message ?? "Failed to create default settings");
      }

      return mapSettings(fallback);
    }

    if (insertError || !created) {
      throw new Error(insertError?.message ?? "Failed to create default settings");
    }

    return mapSettings(created);
  }

  return mapSettings(data);
}

export async function updateSettings(input: SettingsUpdate): Promise<AppSettings> {
  const supabase = createServerSupabaseClient();
  const patch: Database["public"]["Tables"]["app_settings"]["Update"] = {};

  if (input.hourlyRate !== undefined) {
    patch.hourly_rate = input.hourlyRate.toFixed(2);
  }
  if (input.normalEndTime !== undefined) {
    patch.normal_end_time = input.normalEndTime;
  }
  if (input.periodStartDay !== undefined) {
    patch.period_start_day = input.periodStartDay;
  }
  if (input.periodEndDay !== undefined) {
    patch.period_end_day = input.periodEndDay;
  }
  if (input.cycleGoalAmount !== undefined) {
    patch.cycle_goal_amount = input.cycleGoalAmount.toFixed(2);
  }

  const { data, error } = await supabase
    .from("app_settings")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();

  if (error && isMissingColumn(error, ["period_start_day", "period_end_day"]) &&
    (input.periodStartDay !== undefined || input.periodEndDay !== undefined)) {
    throw new Error(
      "ยังไม่ได้เพิ่มคอลัมน์รอบนับ OT ในฐานข้อมูล กรุณารันไฟล์ supabase/migrations/002_ot_period.sql ใน SQL Editor ของ Supabase",
    );
  }

  if (error && isMissingColumn(error, ["cycle_goal_amount"]) && input.cycleGoalAmount !== undefined) {
    throw new Error(GOAL_MIGRATION_ERROR);
  }

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update settings");
  }

  return mapSettings(data);
}

export async function resetSettings(): Promise<AppSettings> {
  return updateSettings({
    hourlyRate: DEFAULT_SETTINGS.hourlyRate,
    normalEndTime: DEFAULT_SETTINGS.normalEndTime,
    periodStartDay: DEFAULT_SETTINGS.periodStartDay,
    periodEndDay: DEFAULT_SETTINGS.periodEndDay,
    cycleGoalAmount: DEFAULT_SETTINGS.cycleGoalAmount,
  });
}
