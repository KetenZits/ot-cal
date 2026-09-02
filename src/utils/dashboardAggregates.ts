import type { OTRecord, OTPeriodSummary, ChartPoint } from "@/types/ot";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from "date-fns";
import { th } from "date-fns/locale";
import { getOtYearBucketRange, toDateKey } from "./dateHelpers";

export function summarizeRecords(records: OTRecord[]): OTPeriodSummary {
  const totalOTMinutes = records.reduce((sum, record) => sum + record.otMinutes, 0);
  const totalOTAmount = records.reduce((sum, record) => sum + record.otAmount, 0);
  const otDays = records.filter((record) => record.otMinutes > 0).length;

  return {
    totalOTMinutes,
    totalOTHours: totalOTMinutes / 60,
    totalOTAmount,
    otDays,
  };
}

export function weekChartData(
  records: OTRecord[],
  rangeStart: Date,
  rangeEnd: Date,
): ChartPoint[] {
  const byDate = indexByDate(records);

  return eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map((day) => {
    const key = toDateKey(day);
    return {
      key,
      label: format(day, "EEEEEE", { locale: th }),
      amount: byDate.get(key)?.otAmount ?? 0,
    };
  });
}

export function monthChartData(
  records: OTRecord[],
  monthStart: Date,
  monthEnd: Date,
): ChartPoint[] {
  const byDate = indexByDate(records);
  const weeks: ChartPoint[] = [];
  let cursor = startOfWeek(monthStart, { weekStartsOn: 1 });
  let index = 1;

  while (cursor <= monthEnd) {
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
    const start = cursor < monthStart ? monthStart : cursor;
    const end = weekEnd > monthEnd ? monthEnd : weekEnd;
    const days = eachDayOfInterval({ start, end });
    const amount = days.reduce((sum, day) => {
      return sum + (byDate.get(toDateKey(day))?.otAmount ?? 0);
    }, 0);

    weeks.push({
      key: `w${index}`,
      label: `${format(start, "d")}-${format(end, "d")}`,
      amount,
    });

    cursor = addDays(weekEnd, 1);
    index += 1;
  }

  return weeks;
}

export function periodChartData(
  records: OTRecord[],
  rangeStart: Date,
  rangeEnd: Date,
): ChartPoint[] {
  const days = differenceInCalendarDays(rangeEnd, rangeStart) + 1;
  if (days <= 16) {
    return weekChartData(records, rangeStart, rangeEnd);
  }
  return monthChartData(records, rangeStart, rangeEnd);
}

export function yearPeriodChartData(
  records: OTRecord[],
  year: Date,
  startDay: number,
  endDay: number,
): ChartPoint[] {
  const byDate = indexByDate(records);

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDate = new Date(year.getFullYear(), monthIndex, 1);
    const { start, end } = getOtYearBucketRange(monthDate, startDay, endDay, monthIndex);
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);
    let amount = 0;

    for (const [key, record] of byDate) {
      if (key >= startKey && key <= endKey) {
        amount += record.otAmount;
      }
    }

    return {
      key: format(monthDate, "yyyy-MM"),
      label: format(monthDate, "MMM", { locale: th }),
      amount,
    };
  });
}

function indexByDate(records: OTRecord[]): Map<string, OTRecord> {
  return new Map(records.map((record) => [record.workDate, record]));
}
