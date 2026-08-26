import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeTime } from "@/utils/dateHelpers";
import { parseNumeric } from "@/utils/format";
import type { AppSettings } from "@/types/settings";
import type { Database } from "@/types/database";

type SettingsRow = Database["public"]["Tables"]["app_settings"]["Row"];

const DEFAULT_SETTINGS = {
  id: 1 as const,
  hourlyRate: 75,
  normalEndTime: "17:00",
};

function mapSettings(row: SettingsRow): AppSettings {
  return {
    id: 1,
    hourlyRate: parseNumeric(row.hourly_rate),
    normalEndTime: normalizeTime(row.normal_end_time),
    updatedAt: row.updated_at,
  };
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
      })
      .select()
      .single();

    if (insertError || !created) {
      throw new Error(insertError?.message ?? "Failed to create default settings");
    }

    return mapSettings(created);
  }

  return mapSettings(data);
}

export async function updateSettings(input: {
  hourlyRate?: number;
  normalEndTime?: string;
}): Promise<AppSettings> {
  const supabase = createServerSupabaseClient();
  const patch: Database["public"]["Tables"]["app_settings"]["Update"] = {};

  if (input.hourlyRate !== undefined) {
    patch.hourly_rate = input.hourlyRate.toFixed(2);
  }
  if (input.normalEndTime !== undefined) {
    patch.normal_end_time = input.normalEndTime;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update settings");
  }

  return mapSettings(data);
}

export async function resetSettings(): Promise<AppSettings> {
  return updateSettings({
    hourlyRate: DEFAULT_SETTINGS.hourlyRate,
    normalEndTime: DEFAULT_SETTINGS.normalEndTime,
  });
}
