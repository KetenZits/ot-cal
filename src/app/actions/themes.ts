"use server";

import { z } from "zod";
import type { ActionResult } from "@/types/actions";
import type { SavedTheme } from "@/types/theme";
import { saveThemeSchema, updateThemeSchema } from "@/lib/validation/schemas";
import {
  deleteTheme,
  getSavedThemes,
  saveTheme,
  updateTheme,
} from "@/data/themes";
import { failAction, requireAppAccess } from "@/lib/access/guard";

export async function getSavedThemesAction(): Promise<ActionResult<SavedTheme[]>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  try {
    const themes = await getSavedThemes();
    return { ok: true, data: themes };
  } catch (error) {
    return failAction(error, "ไม่สามารถโหลดธีมที่บันทึกไว้ได้");
  }
}

export async function saveThemeAction(input: unknown): Promise<ActionResult<SavedTheme>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = saveThemeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const theme = await saveTheme(parsed.data.name, parsed.data.config);
    return { ok: true, data: theme };
  } catch (error) {
    return failAction(error, "ไม่สามารถบันทึกธีมได้");
  }
}

export async function updateThemeAction(input: unknown): Promise<ActionResult<SavedTheme>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = updateThemeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const theme = await updateTheme(parsed.data.id, {
      name: parsed.data.name,
      config: parsed.data.config,
    });
    return { ok: true, data: theme };
  } catch (error) {
    return failAction(error, "ไม่สามารถอัปเดตธีมได้");
  }
}

export async function deleteThemeAction(id: string): Promise<ActionResult<{ id: string }>> {
  const denied = await requireAppAccess();
  if (denied) return denied;

  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) {
    return { ok: false, error: "ธีมไม่ถูกต้อง" };
  }

  try {
    await deleteTheme(parsed.data);
    return { ok: true, data: { id: parsed.data } };
  } catch (error) {
    return failAction(error, "ไม่สามารถลบธีมได้");
  }
}
