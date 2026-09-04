import type { BackupPayload } from "@/lib/validation/schemas";
import { backupSchema } from "@/lib/validation/schemas";
import type { AppSettings } from "@/types/settings";
import type { OTRecord } from "@/types/ot";
import type { SavedTheme } from "@/types/theme";
import { DEFAULT_UI_STYLE_ID, isUiStyleId } from "@/theme/uiStyles";

export function buildBackupPayload(
  settings: AppSettings,
  otRecords: OTRecord[],
  savedThemes: SavedTheme[],
): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: {
      hourlyRate: settings.hourlyRate,
      normalEndTime: settings.normalEndTime,
      periodStartDay: settings.periodStartDay,
      periodEndDay: settings.periodEndDay,
      cycleGoalAmount: settings.cycleGoalAmount,
    },
    otRecords: otRecords.map((record) => ({
      workDate: record.workDate,
      endTime: record.endTime,
      otMinutes: record.otMinutes,
      otAmount: record.otAmount,
      dayKind: record.dayKind,
      note: record.note,
    })),
    savedThemes: savedThemes.map((theme) => ({
      name: theme.name,
      config: {
        ...theme.config,
        uiStyleId: isUiStyleId(theme.config.uiStyleId)
          ? theme.config.uiStyleId
          : DEFAULT_UI_STYLE_ID,
      },
    })),
  };
}

export function parseBackupJson(raw: string): BackupPayload {
  const parsed: unknown = JSON.parse(raw);
  return backupSchema.parse(parsed);
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
