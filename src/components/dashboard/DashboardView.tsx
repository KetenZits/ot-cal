"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { DashboardPeriod, OTRecord } from "@/types/ot";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Card } from "@/components/ui/Card";
import { ErrorState, EmptyState, Spinner } from "@/components/ui/States";
import { Input } from "@/components/ui/Input";
import { getOTRecordsByDateRangeAction } from "@/app/actions/ot";
import {
  formatPeriodRange,
  getOtPeriodRange,
  getOtYearRange,
  getWeekRange,
  parseDateKey,
  toDateKey,
} from "@/utils/dateHelpers";
import {
  periodChartData,
  summarizeRecords,
  weekChartData,
  yearPeriodChartData,
} from "@/utils/dashboardAggregates";
import { formatBaht, formatOTHours } from "@/utils/format";
import { Banknote, CalendarCheck, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSettingsStore } from "@/store/useSettingsStore";

const OTChart = dynamic(
  () => import("./OTChart").then((mod) => mod.OTChart),
  {
    ssr: false,
    loading: () => <div className="h-60 animate-pulse rounded-2xl bg-[var(--surface)]" />,
  },
);

const PERIODS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "week", label: "สัปดาห์" },
  { value: "month", label: "รอบเดือน" },
  { value: "year", label: "ปี" },
  { value: "custom", label: "กำหนดเอง" },
];

export function DashboardView() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [records, setRecords] = useState<OTRecord[]>([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [anchor] = useState(() => new Date());
  const periodStartDay = useSettingsStore((state) => state.periodStartDay);
  const periodEndDay = useSettingsStore((state) => state.periodEndDay);
  const cycle = useMemo(
    () => getOtPeriodRange(anchor, periodStartDay, periodEndDay),
    [anchor, periodStartDay, periodEndDay],
  );
  const [customStart, setCustomStart] = useState(() => toDateKey(cycle.start));
  const [customEnd, setCustomEnd] = useState(() => toDateKey(cycle.end));

  const range = useMemo(() => {
    if (period === "week") return getWeekRange(anchor);
    if (period === "year") return getOtYearRange(anchor, periodStartDay, periodEndDay);
    if (period === "custom") {
      const start = parseDateKey(customStart);
      const end = parseDateKey(customEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return cycle;
      }
      return customStart <= customEnd ? { start, end } : { start: end, end: start };
    }
    return cycle;
  }, [period, anchor, cycle, customStart, customEnd, periodStartDay, periodEndDay]);

  const rangeKey = `${toDateKey(range.start)}:${toDateKey(range.end)}`;
  const loading = fetchedKey !== rangeKey && !error;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await getOTRecordsByDateRangeAction(
        toDateKey(range.start),
        toDateKey(range.end),
      );
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setFetchedKey(rangeKey);
        return;
      }
      setError(null);
      setRecords(result.data);
      setFetchedKey(rangeKey);
    })();

    return () => {
      cancelled = true;
    };
  }, [range.end, range.start, rangeKey, retryCount]);

  const summary = useMemo(() => summarizeRecords(records), [records]);
  const chartData = useMemo(() => {
    if (period === "week") return weekChartData(records, range.start, range.end);
    if (period === "year") {
      return yearPeriodChartData(records, anchor, periodStartDay, periodEndDay);
    }
    return periodChartData(records, range.start, range.end);
  }, [period, records, range.end, range.start, anchor, periodStartDay, periodEndDay]);

  function retry() {
    setError(null);
    setFetchedKey(null);
    setRetryCount((count) => count + 1);
  }

  function changePeriod(next: DashboardPeriod) {
    if (next === "custom") {
      setCustomStart(toDateKey(cycle.start));
      setCustomEnd(toDateKey(cycle.end));
    }
    setError(null);
    setFetchedKey(null);
    setPeriod(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <PageHeader
        eyebrow="Dashboard"
        title="สรุป OT"
        subtitle="ดูชั่วโมง เงิน และจำนวนวันที่ทำล่วงเวลา"
      />
      <SegmentedControl
        label="ช่วงเวลา"
        value={period}
        options={PERIODS}
        onChange={changePeriod}
      />

      {period === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="date"
            label="วันเริ่ม"
            value={customStart}
            onChange={(event) => {
              setError(null);
              setFetchedKey(null);
              setCustomStart(event.target.value);
            }}
          />
          <Input
            type="date"
            label="วันสิ้นสุด"
            value={customEnd}
            onChange={(event) => {
              setError(null);
              setFetchedKey(null);
              setCustomEnd(event.target.value);
            }}
          />
        </div>
      ) : null}

      <p className="text-sm text-[var(--text-muted)]">
        {formatPeriodRange(range.start, range.end)}
      </p>

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={<Clock3 size={18} />}
              label="OT ทั้งหมด"
              value={`${formatOTHours(summary.totalOTMinutes)} ชั่วโมง`}
            />
            <SummaryCard
              icon={<Banknote size={18} />}
              label="เงิน OT"
              value={formatBaht(summary.totalOTAmount)}
              accent
            />
            <SummaryCard
              icon={<CalendarCheck size={18} />}
              label="จำนวนวันที่ทำ OT"
              value={`${summary.otDays} วัน`}
            />
          </div>

          {records.length === 0 ? (
            <EmptyState />
          ) : (
            <Card>
              <p className="mb-3 text-sm font-medium">แนวโน้มตามช่วงเวลา</p>
              <OTChart data={chartData} period={period} />
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
        {icon}
      </div>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "text-[var(--accent)]" : ""}`}>
        {value}
      </p>
    </Card>
  );
}
