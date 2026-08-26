"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { OTRecord } from "@/types/ot";
import {
  formatMonthTitle,
  getCalendarDays,
  getCalendarGridRange,
  isCurrentMonth,
  isToday,
  shiftMonth,
  toDateKey,
} from "@/utils/dateHelpers";
import { formatBaht, formatCompactBaht, formatOTHours } from "@/utils/format";
import { summarizeRecords } from "@/utils/dashboardAggregates";
import { getOTRecordsByDateRangeAction } from "@/app/actions/ot";
import { ErrorState, Spinner } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoMark, PageHeader } from "@/components/ui/PageHeader";
import { DayEntrySheet } from "@/components/ot/DayEntrySheet";
import { useUIStore } from "@/store/useUIStore";

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

  const range = useMemo(() => getCalendarGridRange(month), [month]);
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
  const monthSummary = useMemo(() => {
    const list = [...records.values()].filter((record) => record.workDate.startsWith(monthKey));
    return summarizeRecords(list);
  }, [records, monthKey]);

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
    <div className="mx-auto w-full min-w-0 max-w-lg">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <LogoMark />
          <PageHeader
            className="mb-0"
            eyebrow="OT Calculator"
            title={formatMonthTitle(month)}
            subtitle="แตะวันที่เพื่อบันทึกเวลาเลิกงาน"
          />
        </div>
      </div>

      <div
        className="mb-4 rounded-[28px] p-5 text-white shadow-[0_18px_36px_color-mix(in_srgb,var(--accent)_28%,transparent)]"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 55%, #ff3b6b) 100%)",
        }}
      >
        <p className="text-sm text-white/80">เงิน OT เดือนนี้</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {formatBaht(monthSummary.totalOTAmount)}
        </p>
        <p className="mt-2 text-sm text-white/80">
          {formatOTHours(monthSummary.totalOTMinutes)} ชั่วโมง · {monthSummary.otDays} วัน
        </p>
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

      <Card className="min-w-0 overflow-hidden p-4">
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
                    const today = isToday(day);
                    const hasOT = Boolean(record && record.otMinutes > 0);
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
                        className={`flex min-h-[5.75rem] flex-col items-center justify-start rounded-[22px] px-2 py-2.5 text-left transition-colors ${
                          inMonth ? "text-[var(--text)]" : "text-[var(--text-muted)] opacity-40"
                        } ${
                          hasOT
                            ? "bg-[color-mix(in_srgb,var(--accent)_14%,white)]"
                            : "bg-[color-mix(in_srgb,var(--text)_5%,var(--surface))]"
                        } ${today ? "ring-2 ring-[var(--accent)]" : ""}`}
                        aria-label={`${key}${record ? `, OT ${formatCompactBaht(record.otAmount)}` : ""}`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                            today ? "bg-[var(--accent)] text-white" : ""
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {record ? (
                          <motion.span
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-[11px] font-semibold text-[var(--accent)]"
                          >
                            {formatCompactBaht(record.otAmount)}
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
          เลื่อนตารางไปทางขวาได้ ถ้าช่องวันที่แคบเกินไป
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
