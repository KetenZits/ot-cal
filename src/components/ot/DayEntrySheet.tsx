"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import { useOnlineStatus } from "@/hooks/useClientEnvironment";
import { calculateOT } from "@/utils/otCalculator";
import { formatBaht, formatOTDuration } from "@/utils/format";
import { formatFullDate, normalizeTime, parseDateKey } from "@/utils/dateHelpers";
import { deleteOTRecordAction, saveOTRecordAction } from "@/app/actions/ot";
import { DAY_KIND_LABEL, getDayKind, type DayKind, type OTRecord } from "@/types/ot";

interface DayEntrySheetProps {
  dateKey: string | null;
  record: OTRecord | null;
  onClose: () => void;
  onSaved: (record: OTRecord) => void;
  onDeleted: (workDate: string) => void;
}

const KIND_OPTIONS: Array<{ value: DayKind; label: string }> = [
  { value: "ot", label: DAY_KIND_LABEL.ot },
  { value: "off", label: DAY_KIND_LABEL.off },
  { value: "absent", label: DAY_KIND_LABEL.absent },
];

export function DayEntrySheet({
  dateKey,
  record,
  onClose,
  onSaved,
  onDeleted,
}: DayEntrySheetProps) {
  const hourlyRate = useSettingsStore((state) => state.hourlyRate);
  const normalEndTime = useSettingsStore((state) => state.normalEndTime);
  const online = useOnlineStatus();
  const showToast = useUIStore((state) => state.showToast);

  const [dayKind, setDayKind] = useState<DayKind>(() => getDayKind(record));
  const [endTime, setEndTime] = useState(() => {
    if (getDayKind(record) !== "ot") return normalEndTime;
    return record?.endTime ?? normalEndTime;
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const preview = useMemo(
    () =>
      calculateOT({
        normalEndTime,
        actualEndTime: endTime || normalEndTime,
        hourlyRate,
      }),
    [endTime, hourlyRate, normalEndTime],
  );

  const workDate = dateKey;
  const title = workDate ? formatFullDate(parseDateKey(workDate)) : "รายการ OT";
  const existing = Boolean(record);

  function changeKind(next: DayKind) {
    setDayKind(next);
    if (next === "ot" && (!endTime || endTime === "00:00")) {
      setEndTime(normalEndTime);
    }
  }

  async function save() {
    if (!workDate) return;
    if (!online) {
      showToast("ออฟไลน์อยู่ ยังบันทึกไม่ได้", "error");
      return;
    }
    setSaving(true);
    const result = await saveOTRecordAction({
      workDate,
      dayKind,
      endTime: dayKind === "ot" ? normalizeTime(endTime) : undefined,
    });
    setSaving(false);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    onSaved(result.data);
  }

  async function remove() {
    if (!workDate) return;
    if (!online) {
      showToast("ออฟไลน์อยู่ ยังลบไม่ได้", "error");
      return;
    }
    setDeleting(true);
    const result = await deleteOTRecordAction(workDate);
    setDeleting(false);
    setConfirmDelete(false);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    onDeleted(workDate);
  }

  return (
    <>
      <BottomSheet open={Boolean(dateKey) && !confirmDelete} title={title} onClose={onClose}>
        <div className="flex flex-col gap-5">
          <SegmentedControl
            label="ประเภทวัน"
            value={dayKind}
            options={KIND_OPTIONS}
            onChange={changeKind}
          />

          {dayKind === "ot" ? (
            <>
              <Input
                type="time"
                name="endTime"
                label="เวลาเลิกงาน"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />

              <div>
                <p className="text-sm text-[var(--text-muted)]">OT ที่คำนวณได้</p>
                <div className="ui-control mt-2 bg-[color-mix(in_srgb,var(--text)_5%,var(--surface))] px-4 py-4">
                  <p className="text-3xl font-semibold tracking-tight">
                    {formatOTDuration(preview.otMinutes)}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[var(--accent)]">
                    {formatBaht(preview.otAmount)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="ui-control bg-[color-mix(in_srgb,var(--text)_5%,var(--surface))] px-4 py-4">
              <p className="text-lg font-semibold">
                {dayKind === "off" ? "วันหยุด" : "ไม่มาทำงาน"}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                วันนี้จะไม่นับเป็น OT และไม่คิดเงิน
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "กำลังบันทึก..." : existing ? "บันทึก" : "ยืนยัน"}
            </Button>
            {existing ? (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                ลบรายการ
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose}>
              ยกเลิก
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmDelete}
        title="ลบรายการ"
        description="ต้องการลบรายการของวันนี้หรือไม่?"
        confirmLabel="ลบรายการ"
        danger
        pending={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
