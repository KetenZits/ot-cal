"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { OTRecord } from "@/types/ot";
import {
  formatMonthTitle,
  formatPeriodRange,
  getCalendarDays,
  getCalendarGridRange,
  getOtPeriodRange,
  isCurrentMonth,
  isInInclusiveRange,
  isToday,
  shiftMonth,
  toDateKey,
  unionDateRange,
} from "@/utils/dateHelpers";
import { formatBaht, formatCompactBaht, formatOTHours } from "@/utils/format";
import { summarizeRecords } from "@/utils/dashboardAggregates";
import { getOTRecordsByDateRangeAction } from "@/app/actions/ot";
import { ErrorState, Spinner } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoMark, PageHeader } from "@/components/ui/PageHeader";
import { DayEntrySheet } from "@/components/ot/DayEntrySheet";
import { GoalProgress } from "@/components/ot/GoalProgress";
import { useUIStore } from "@/store/useUIStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DAY_KIND_LABEL, getDayKind, type DayKind } from "@/types/ot";

const WEEKDAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

export function CalendarView() {
  const [month, setMonth] = useState(() => new Date());
  const [direction, setDirection] = useState(0);
  const [records, setRecords] = useState<Map<string, OTRecord>>(new Map());
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const showToast = useUIStore((state) => state.showToast);
  const periodStartDay = useSettingsStore((state) => state.periodStartDay);
  const periodEndDay = useSettingsStore((state) => state.periodEndDay);
  const cycleGoalAmount = useSettingsStore((state) => state.cycleGoalAmount);
  const hourlyRate = useSettingsStore((state) => state.hourlyRate);

  const period = useMemo(
    () => getOtPeriodRange(month, periodStartDay, periodEndDay),
    [month, periodStartDay, periodEndDay],
  );
  const range = useMemo(
    () => unionDateRange(getCalendarGridRange(month), period),
    [month, period],
  );
  const days = useMemo(() => getCalendarDays(month), [month]);
  const startDate = toDateKey(range.start);
  const endDate = toDateKey(range.end);
  const rangeKey = `${startDate}:${endDate}`;
  const loading = fetchedKey !== rangeKey && !error;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getOTRecordsByDateRangeAction(startDate, endDate);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setFetchedKey(rangeKey);
        return;
      }
      setError(null);
      setRecords(new Map(result.data.map((record) => [record.workDate, record])));
      setFetchedKey(rangeKey);
    })();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, rangeKey, retryCount]);

  const monthKey = toDateKey(month).slice(0, 7);
  const periodStartKey = toDateKey(period.start);
  const periodEndKey = toDateKey(period.end);
  const monthSummary = useMemo(() => {
    const list = [...records.values()].filter(
      (record) => record.workDate >= periodStartKey && record.workDate <= periodEndKey,
    );
    return summarizeRecords(list);
  }, [records, periodStartKey, periodEndKey]);

  function retry() {
    setError(null);
    setFetchedKey(null);
    setRetryCount((count) => count + 1);
  }

  function goToMonth(next: Date, dir: number) {
    setError(null);
    setFetchedKey(null);
    setDirection(dir);
    setMonth(next);
  }

  function handleSaved(record: OTRecord) {
    setRecords((current) => {
      const next = new Map(current);
      next.set(record.workDate, record);
      return next;
    });
    setHighlightKey(record.workDate);
    setSelectedDate(null);
    showToast("บันทึกแล้ว", "success");
  }

  function handleDeleted(workDate: string) {
    setRecords((current) => {
      const next = new Map(current);
      next.delete(workDate);
      return next;
    });
    setSelectedDate(null);
    showToast("ลบรายการแล้ว", "success");
  }

  const selectedRecord = selectedDate ? (records.get(selectedDate) ?? null) : null;

  return (
    <div className="ui-scene mx-auto w-full min-w-0 max-w-lg">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <LogoMark />
          <PageHeader
            className="mb-0"
            eyebrow="OT Calculator"
            title={formatMonthTitle(month)}
            subtitle="แตะวันที่เพื่อบันทึก OT วันหยุด หรือไม่มา"
          />
        </div>
      </div>

      <div className="ui-banner mb-4 p-5">
        <p className="ui-banner-kicker text-sm">เงิน OT รอบนี้</p>
        <p className="ui-banner-value mt-1 text-3xl font-semibold">
          {formatBaht(monthSummary.totalOTAmount)}
        </p>
        <p className="ui-banner-meta mt-2 text-sm">
          {formatOTHours(monthSummary.totalOTMinutes)} ชั่วโมง · {monthSummary.otDays} วัน OT
          {monthSummary.offDays > 0 ? ` · หยุด ${monthSummary.offDays}` : ""}
          {monthSummary.absentDays > 0 ? ` · ไม่มา ${monthSummary.absentDays}` : ""}
        </p>
        <p className="ui-banner-meta mt-2 text-xs">
          {formatPeriodRange(period.start, period.end)}
        </p>
        <GoalProgress
          current={monthSummary.totalOTAmount}
          goal={cycleGoalAmount}
          hourlyRate={hourlyRate}
          variant="banner"
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          className="min-h-11 w-11 px-0"
          onClick={() => goToMonth(shiftMonth(month, -1), -1)}
          aria-label="เดือนก่อนหน้า"
        >
          <ChevronLeft size={20} />
        </Button>
        <Button variant="secondary" onClick={() => goToMonth(new Date(), 0)}>
          วันนี้
        </Button>
        <Button
          variant="ghost"
          className="min-h-11 w-11 px-0"
          onClick={() => goToMonth(shiftMonth(month, 1), 1)}
          aria-label="เดือนถัดไป"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <Card className="min-w-0 p-4">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : (
          <div className="calendar-scroll">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={monthKey}
                custom={direction}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="w-[42rem]"
              >
                <div className="mb-2 grid grid-cols-7 text-center text-[13px] font-medium text-[var(--text-muted)]">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day) => {
                    const key = toDateKey(day);
                    const record = records.get(key);
                    const inMonth = isCurrentMonth(day, month);
                    const inPeriod = isInInclusiveRange(day, period.start, period.end);
                    const today = isToday(day);
                    const hasOT = Boolean(record && getDayKind(record) === "ot" && record.otMinutes > 0);
                    const dayKind = record ? getDayKind(record) : null;
                    const highlighted = highlightKey === key;

                    return (
                      <motion.button
                        key={key}
                        type="button"
                        onClick={() => setSelectedDate(key)}
                        whileTap={{ scale: 0.96 }}
                        animate={
                          highlighted
                            ? { scale: [1, 1.05, 1], opacity: [0.7, 1] }
                            : { scale: 1, opacity: 1 }
                        }
                        onAnimationComplete={() => {
                          if (highlighted) setHighlightKey(null);
                        }}
                        className={`ui-day flex min-h-[5.75rem] flex-col items-center justify-start px-2 py-2.5 text-left transition-colors ${
                          inPeriod ? "text-[var(--text)]" : "text-[var(--text-muted)] opacity-45"
                        } ${dayCellClass(dayKind, hasOT)} ${today ? "ring-2 ring-[var(--accent)]" : ""} ${
                          !inMonth && inPeriod
                            ? "ring-1 ring-[color-mix(in_srgb,var(--accent)_40%,transparent)]"
                            : ""
                        }`}
                        aria-label={dayAriaLabel(key, dayKind, record?.otAmount ?? 0)}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center text-sm font-semibold ${
                            today ? "bg-[var(--accent)] text-[var(--on-accent)]" : ""
                          }`}
                          style={{ borderRadius: "var(--radius-button)" }}
                        >
                          {day.getDate()}
                        </span>
                        {record ? (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-2 text-[11px] font-semibold ${
                              dayKind === "ot" ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                            }`}
                          >
                            {dayKind === "ot"
                              ? formatCompactBaht(record.otAmount)
                              : DAY_KIND_LABEL[dayKind ?? "ot"]}
                          </motion.span>
                        ) : null}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
          จาง = นอกรอบนับ · สีเน้น = OT · เทา = หยุด · เข้ม = ไม่มา
        </p>
      </Card>

      <DayEntrySheet
        key={selectedDate ?? "closed"}
        dateKey={selectedDate}
        record={selectedRecord}
        onClose={() => setSelectedDate(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

function dayCellClass(kind: DayKind | null, hasOT: boolean): string {
  if (kind === "off") {
    return "bg-[color-mix(in_srgb,var(--text-muted)_30%,var(--surface))]";
  }
  if (kind === "absent") {
    return "bg-[color-mix(in_srgb,var(--primary)_22%,var(--surface))]";
  }
  if (hasOT) {
    return "bg-[color-mix(in_srgb,var(--accent)_22%,var(--surface))]";
  }
  return "bg-[color-mix(in_srgb,var(--text)_10%,var(--surface))]";
}

function dayAriaLabel(dateKey: string, kind: DayKind | null, amount: number): string {
  if (kind === "off") return `${dateKey}, วันหยุด`;
  if (kind === "absent") return `${dateKey}, ไม่มา`;
  if (kind === "ot") return `${dateKey}, OT ${formatCompactBaht(amount)}`;
  return dateKey;
}
