import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { themeConfigSchema } from "@/lib/validation/schemas";
import type { SavedTheme, ThemeConfig } from "@/types/theme";
import type { Database } from "@/types/database";

type ThemeRow = Database["public"]["Tables"]["saved_themes"]["Row"];

function mapTheme(row: ThemeRow): SavedTheme {
  return {
    id: row.id,
    name: row.name,
    config: themeConfigSchema.parse(row.config),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSavedThemes(): Promise<SavedTheme[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("saved_themes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTheme);
}

export async function saveTheme(name: string, config: ThemeConfig): Promise<SavedTheme> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("saved_themes")
    .insert({
      name,
      config: config as unknown as Database["public"]["Tables"]["saved_themes"]["Insert"]["config"],
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save theme");
  }

  return mapTheme(data);
}

export async function updateTheme(
  id: string,
  patch: { name?: string; config?: ThemeConfig },
): Promise<SavedTheme> {
  const supabase = createServerSupabaseClient();
  const update: Database["public"]["Tables"]["saved_themes"]["Update"] = {};

  if (patch.name !== undefined) {
    update.name = patch.name;
  }
  if (patch.config !== undefined) {
    update.config =
      patch.config as unknown as Database["public"]["Tables"]["saved_themes"]["Update"]["config"];
  }

  const { data, error } = await supabase
    .from("saved_themes")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update theme");
  }

  return mapTheme(data);
}

export async function deleteTheme(id: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("saved_themes").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAllThemes(): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("saved_themes").delete().not("id", "is", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function replaceAllThemes(
  themes: Array<{ name: string; config: ThemeConfig }>,
): Promise<void> {
  await deleteAllThemes();

  if (themes.length === 0) {
    return;
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("saved_themes").insert(
    themes.map((theme) => ({
      name: theme.name,
      config:
        theme.config as unknown as Database["public"]["Tables"]["saved_themes"]["Insert"]["config"],
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}
