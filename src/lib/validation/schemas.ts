import { z } from "zod";

export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const HEX_COLOR_RE = /^#([0-9A-Fa-f]{6})$/;

export const dateKeySchema = z
  .string()
  .regex(DATE_KEY_RE, "วันที่ไม่ถูกต้อง");

export const timeSchema = z
  .string()
  .regex(TIME_RE, "เวลาไม่ถูกต้อง");

export const hexColorSchema = z
  .string()
  .regex(HEX_COLOR_RE, "สีต้องเป็นรหัส hex เช่น #22C55E");

export const hourlyRateSchema = z
  .number()
  .finite()
  .min(0, "ค่า OT ต้องไม่ติดลบ");

export const periodDaySchema = z
  .number()
  .int("วันที่ต้องเป็นจำนวนเต็ม")
  .min(1, "วันที่ต้องอยู่ระหว่าง 1–31")
  .max(31, "วันที่ต้องอยู่ระหว่าง 1–31");

export const otMinutesSchema = z.number().int().min(0);
export const otAmountSchema = z.number().finite().min(0);

export const themeColorsSchema = z.object({
  background: hexColorSchema,
  surface: hexColorSchema,
  primary: hexColorSchema,
  accent: hexColorSchema,
  text: hexColorSchema,
  textMuted: hexColorSchema,
});

export const themeConfigSchema = z.object({
  mode: z.enum(["preset", "custom"]),
  presetId: z.string().optional(),
  uiStyleId: z
    .enum([
      "street",
      "modern",
      "luxury",
      "glass",
      "neubrutalism",
      "immersive",
      "minimal",
      "flat",
    ])
    .optional()
    .default("modern"),
  colors: themeColorsSchema,
});

export const settingsUpdateSchema = z
  .object({
    hourlyRate: hourlyRateSchema.optional(),
    normalEndTime: timeSchema.optional(),
    periodStartDay: periodDaySchema.optional(),
    periodEndDay: periodDaySchema.optional(),
  })
  .refine(
    (value) =>
      value.hourlyRate !== undefined ||
      value.normalEndTime !== undefined ||
      value.periodStartDay !== undefined ||
      value.periodEndDay !== undefined,
    { message: "ต้องระบุค่าที่ต้องการอัปเดต" },
  );

export const otUpsertSchema = z.object({
  workDate: dateKeySchema,
  endTime: timeSchema,
  note: z.string().max(500).nullable().optional(),
});

export const saveThemeSchema = z.object({
  name: z.string().trim().min(1, "กรุณาตั้งชื่อธีม").max(60),
  config: themeConfigSchema,
});

export const updateThemeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(60).optional(),
  config: themeConfigSchema.optional(),
});

export const settingsBackupSchema = z.object({
  hourlyRate: hourlyRateSchema,
  normalEndTime: timeSchema,
  periodStartDay: periodDaySchema.optional().default(26),
  periodEndDay: periodDaySchema.optional().default(26),
});

export const otRecordBackupSchema = z.object({
  workDate: dateKeySchema,
  endTime: timeSchema,
  otMinutes: otMinutesSchema,
  otAmount: otAmountSchema,
  note: z.string().nullable().optional(),
});

export const savedThemeBackupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  config: themeConfigSchema,
});

export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().min(1),
  settings: settingsBackupSchema,
  otRecords: z.array(otRecordBackupSchema),
  savedThemes: z.array(savedThemeBackupSchema),
});

export type BackupPayload = z.infer<typeof backupSchema>;
