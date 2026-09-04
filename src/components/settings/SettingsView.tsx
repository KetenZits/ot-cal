"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useUIStore } from "@/store/useUIStore";
import { useOnlineStatus } from "@/hooks/useClientEnvironment";
import { updateSettingsAction } from "@/app/actions/settings";
import {
  deleteAllDataAction,
  exportDataAction,
  importDataAction,
} from "@/app/actions/data";
import { THEME_COLOR_KEYS, THEME_PRESETS } from "@/theme/presets";
import { UI_STYLES } from "@/theme/uiStyles";
import { applyThemeToDocument } from "@/theme/themeProvider";
import { deleteThemeAction, saveThemeAction } from "@/app/actions/themes";
import { downloadJson, parseBackupJson } from "@/utils/exportImport";
import type { BackupPayload } from "@/lib/validation/schemas";
import type { ThemeColors, ThemeConfig } from "@/types/theme";
import { InstallSection } from "./InstallSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPeriodRange, getOtPeriodRange } from "@/utils/dateHelpers";

export function SettingsView() {
  return (
    <div className="ui-scene mx-auto flex w-full max-w-lg flex-col gap-4">
      <PageHeader
        eyebrow="Settings"
        title="ตั้งค่า"
        subtitle="อัตรา OT เป้าหมายรอบ เวลาเลิกงานปกติ ธีม UI และการสำรองข้อมูล"
      />
      <OTSettingsCard />
      <ThemeSection />
      <InstallSection />
      <DataSection />
    </div>
  );
}

function parsePeriodDay(value: string): number | null {
  const next = Number(value);
  if (!Number.isInteger(next) || next < 1 || next > 31) return null;
  return next;
}

function OTSettingsCard() {
  const hourlyRate = useSettingsStore((state) => state.hourlyRate);
  const normalEndTime = useSettingsStore((state) => state.normalEndTime);
  const periodStartDay = useSettingsStore((state) => state.periodStartDay);
  const periodEndDay = useSettingsStore((state) => state.periodEndDay);
  const cycleGoalAmount = useSettingsStore((state) => state.cycleGoalAmount);
  const setLocal = useSettingsStore((state) => state.setLocal);
  const hydrate = useSettingsStore((state) => state.hydrate);
  const showToast = useUIStore((state) => state.showToast);
  const online = useOnlineStatus();

  const { register, handleSubmit, setValue, watch } = useForm({
    values: {
      hourlyRate: hourlyRate.toFixed(2),
      normalEndTime,
      periodStartDay: String(periodStartDay),
      periodEndDay: String(periodEndDay),
      cycleGoalAmount: cycleGoalAmount.toFixed(2),
    },
  });

  const watchedStart = watch("periodStartDay");
  const watchedEnd = watch("periodEndDay");
  const previewStart = parsePeriodDay(watchedStart) ?? periodStartDay;
  const previewEnd = parsePeriodDay(watchedEnd) ?? periodEndDay;
  const previewRange = getOtPeriodRange(new Date(), previewStart, previewEnd);

  async function onSubmit(values: {
    hourlyRate: string;
    normalEndTime: string;
    periodStartDay: string;
    periodEndDay: string;
    cycleGoalAmount: string;
  }) {
    const nextRate = Number(values.hourlyRate);
    if (!Number.isFinite(nextRate) || nextRate < 0) {
      showToast("ค่า OT ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", "error");
      return;
    }

    const nextGoal = Number(values.cycleGoalAmount);
    if (!Number.isFinite(nextGoal) || nextGoal < 0) {
      showToast("เป้าหมายต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", "error");
      return;
    }

    const nextStart = parsePeriodDay(values.periodStartDay);
    const nextEnd = parsePeriodDay(values.periodEndDay);
    if (nextStart == null || nextEnd == null) {
      showToast("วันที่เริ่มและสิ้นสุดต้องเป็นตัวเลข 1–31", "error");
      return;
    }

    const previous = {
      hourlyRate,
      normalEndTime,
      periodStartDay,
      periodEndDay,
      cycleGoalAmount,
    };
    setLocal({
      hourlyRate: nextRate,
      normalEndTime: values.normalEndTime,
      periodStartDay: nextStart,
      periodEndDay: nextEnd,
      cycleGoalAmount: nextGoal,
    });

    if (!online) {
      showToast("ออฟไลน์อยู่ ยังบันทึกไม่ได้", "error");
      setLocal(previous);
      return;
    }

    const result = await updateSettingsAction({
      hourlyRate: nextRate,
      normalEndTime: values.normalEndTime,
      periodStartDay: nextStart,
      periodEndDay: nextEnd,
      cycleGoalAmount: nextGoal,
    });

    if (!result.ok) {
      setLocal(previous);
      showToast(result.error, "error");
      return;
    }

    hydrate(result.data);
    showToast("บันทึกการตั้งค่าแล้ว", "success");
  }

  function applyPreset(start: number, end: number) {
    setValue("periodStartDay", String(start), { shouldDirty: true });
    setValue("periodEndDay", String(end), { shouldDirty: true });
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">การคำนวณ OT</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">ใช้คำนวณทุกครั้งที่บันทึกเวลาเลิกงาน</p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          label="ค่า OT ต่อชั่วโมง"
          hint="บาท"
          {...register("hourlyRate")}
        />
        <Input
          type="time"
          label="เวลาเลิกงานปกติ"
          {...register("normalEndTime")}
        />
        <div>
          <p className="mb-2 text-sm font-medium">รอบนับ OT</p>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            ถ้าวันเริ่มมากกว่าหรือเท่ากับวันสิ้นสุด จะนับจากเดือนก่อนหน้าถึงเดือนนี้ เช่น 26 ถึง 26 คือ 26 เดือนก่อน ถึง 26 เดือนนี้
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="min-h-10 px-3 text-sm" onClick={() => applyPreset(26, 26)}>
              รอบ 26–26
            </Button>
            <Button type="button" variant="secondary" className="min-h-10 px-3 text-sm" onClick={() => applyPreset(1, 31)}>
              ปฏิทินเดือน 1–31
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min="1"
              max="31"
              inputMode="numeric"
              label="วันเริ่ม"
              {...register("periodStartDay")}
            />
            <Input
              type="number"
              min="1"
              max="31"
              inputMode="numeric"
              label="วันสิ้นสุด"
              {...register("periodEndDay")}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            ตัวอย่างรอบเดือนนี้: {formatPeriodRange(previewRange.start, previewRange.end)}
          </p>
        </div>
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          label="เป้าหมายต่อรอบ"
          hint="บาท — ใส่ 0 ถ้าไม่ต้องการแสดงเป้า"
          {...register("cycleGoalAmount")}
        />
        <Button type="submit">บันทึก</Button>
      </form>
    </Card>
  );
}

function ThemeSection() {
  const config = useThemeStore((state) => state.config);
  const setConfig = useThemeStore((state) => state.setConfig);
  const applyPreset = useThemeStore((state) => state.applyPreset);
  const applyUiStyle = useThemeStore((state) => state.applyUiStyle);
  const savedThemes = useThemeStore((state) => state.savedThemes);
  const addSavedTheme = useThemeStore((state) => state.addSavedTheme);
  const removeSavedTheme = useThemeStore((state) => state.removeSavedTheme);
  const showToast = useUIStore((state) => state.showToast);
  const [themeName, setThemeName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const activeUi = config.uiStyleId ?? "modern";

  function updateColor(key: keyof ThemeColors, value: string) {
    const next: ThemeConfig = {
      mode: "custom",
      uiStyleId: config.uiStyleId,
      colors: { ...config.colors, [key]: value },
    };
    setConfig(next);
    applyThemeToDocument(next);
  }

  async function saveCurrent() {
    const name = themeName.trim();
    if (!name) {
      showToast("กรุณาตั้งชื่อธีม", "error");
      return;
    }
    setSaving(true);
    const result = await saveThemeAction({
      name,
      config: {
        mode: "custom",
        uiStyleId: config.uiStyleId,
        colors: config.colors,
      },
    });
    setSaving(false);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    addSavedTheme(result.data);
    setThemeName("");
    showToast("บันทึกธีมแล้ว", "success");
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const result = await deleteThemeAction(deleteId);
    if (!result.ok) {
      showToast(result.error, "error");
      setDeleteId(null);
      return;
    }
    removeSavedTheme(deleteId);
    setDeleteId(null);
    showToast("ลบธีมแล้ว", "success");
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">ธีม</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        เลือกโทนสีกับสไตล์ UI ได้แยกกัน หรือปรับสีเองแล้วบันทึกไว้ใช้ซ้ำ
      </p>

      <h3 className="mb-3 font-medium">สไตล์ UI</h3>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {UI_STYLES.map((style) => {
          const selected = activeUi === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => applyUiStyle(style.id)}
              className={`ui-picker min-h-16 px-3 py-2.5 text-left ${
                selected ? "ring-2 ring-[var(--accent)]" : ""
              }`}
            >
              <span className="style-thumb" data-thumb={style.id} aria-hidden="true">
                <span className="style-thumb-card" />
                <span className="style-thumb-bar" />
              </span>
              <span className="block text-sm font-semibold">{style.name}</span>
              <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{style.hint}</span>
            </button>
          );
        })}
      </div>

      <h3 className="mb-3 font-medium">โทนสี</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {THEME_PRESETS.map((preset) => {
          const selected = config.mode === "preset" && config.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                applyPreset(preset.id);
                applyThemeToDocument({ ...preset.config, uiStyleId: config.uiStyleId });
              }}
              className={`ui-picker min-h-11 px-3 text-left text-sm ${
                selected ? "ring-2 ring-[var(--accent)]" : ""
              }`}
            >
              <span
                className="mb-2 mt-2 block h-3 w-full"
                style={{
                  background: preset.config.colors.accent,
                  borderRadius: "var(--radius-button)",
                }}
              />
              {preset.name}
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 mb-3 font-medium">ปรับสีเอง</h3>
      <div className="grid gap-3">
        {THEME_COLOR_KEYS.map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-3 text-sm">
            <span>{item.label}</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={config.colors[item.key]}
                onChange={(event) => updateColor(item.key, event.target.value)}
                className="h-11 w-11 cursor-pointer rounded-lg bg-transparent"
                aria-label={item.label}
              />
              <input
                value={config.colors[item.key]}
                onChange={(event) => updateColor(item.key, event.target.value)}
                className="min-h-11 w-28 rounded-xl border border-[color-mix(in_srgb,var(--text)_14%,transparent)] bg-[color-mix(in_srgb,var(--text)_8%,var(--surface))] px-2 font-mono text-sm text-[var(--text)]"
              />
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-[var(--background)] p-4 text-[var(--on-background)]">
        <p className="text-sm text-[color-mix(in_srgb,var(--on-background)_72%,transparent)]">ตัวอย่าง</p>
        <p className="mt-1 text-lg font-semibold">OT Calculator</p>
        <p className="text-[var(--accent)]">฿225.00</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Input
          label="Save as new theme"
          placeholder="ชื่อธีม"
          value={themeName}
          onChange={(event) => setThemeName(event.target.value)}
        />
        <Button onClick={() => void saveCurrent()} disabled={saving}>
          {saving ? "กำลังบันทึก..." : "Save as new theme"}
        </Button>
      </div>

      <h3 className="mt-6 mb-3 font-medium">ธีมที่บันทึกไว้</h3>
      {savedThemes.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">ยังไม่มีธีมที่บันทึก</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {savedThemes.map((theme) => (
            <li
              key={theme.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-[var(--background)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ background: theme.config.colors.accent }}
                />
                <span className="text-sm">{theme.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="min-h-10 px-3"
                  onClick={() => {
                    setConfig(theme.config);
                    applyThemeToDocument(theme.config);
                  }}
                >
                  Apply
                </Button>
                <Button
                  variant="danger"
                  className="min-h-10 px-3"
                  onClick={() => setDeleteId(theme.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="ลบธีม"
        description="ต้องการลบธีมนี้หรือไม่?"
        confirmLabel="ลบธีม"
        danger
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteId(null)}
      />
    </Card>
  );
}

function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const showToast = useUIStore((state) => state.showToast);
  const hydrate = useSettingsStore((state) => state.hydrate);
  const setSavedThemes = useThemeStore((state) => state.setSavedThemes);
  const [confirmImport, setConfirmImport] = useState<BackupPayload | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [pending, setPending] = useState(false);

  async function exportData() {
    const result = await exportDataAction();
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    downloadJson(`ot-backup-${result.data.exportedAt.slice(0, 10)}.json`, result.data);
    showToast("ส่งออกข้อมูลแล้ว", "success");
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseBackupJson(text);
      setConfirmImport(parsed);
    } catch {
      showToast("ไฟล์สำรองข้อมูลไม่ถูกต้อง", "error");
    }
  }

  async function doImport() {
    if (!confirmImport) return;
    setPending(true);
    const result = await importDataAction(confirmImport);
    setPending(false);
    setConfirmImport(null);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    hydrate(confirmImport.settings);
    setSavedThemes([]);
    showToast("นำเข้าข้อมูลแล้ว", "success");
    window.location.reload();
  }

  async function doDeleteAll() {
    setPending(true);
    const result = await deleteAllDataAction();
    setPending(false);
    setConfirmDeleteAll(false);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    hydrate({
      hourlyRate: 75,
      normalEndTime: "17:00",
      periodStartDay: 26,
      periodEndDay: 26,
      cycleGoalAmount: 0,
    });
    setSavedThemes([]);
    showToast("ลบข้อมูลทั้งหมดแล้ว", "success");
    window.location.reload();
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">ข้อมูล</h2>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={() => void exportData()}>
          Export Data
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          Import Data
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => void onFile(event)}
        />
        <Button variant="danger" onClick={() => setConfirmDeleteAll(true)}>
          ลบข้อมูลทั้งหมด
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(confirmImport)}
        title="นำเข้าข้อมูล"
        description="การนำเข้าจะแทนที่ข้อมูลทั้งหมดที่มีอยู่ ต้องการดำเนินการต่อหรือไม่?"
        confirmLabel="นำเข้าและแทนที่"
        danger
        pending={pending}
        onConfirm={() => void doImport()}
        onCancel={() => setConfirmImport(null)}
      />
      <ConfirmDialog
        open={confirmDeleteAll}
        title="ลบข้อมูลทั้งหมด"
        description="จะลบรายการ OT, ธีมที่บันทึก และรีเซ็ตการตั้งค่า ต้องการดำเนินการต่อหรือไม่?"
        confirmLabel="ลบข้อมูลทั้งหมด"
        danger
        pending={pending}
        onConfirm={() => void doDeleteAll()}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </Card>
  );
}
