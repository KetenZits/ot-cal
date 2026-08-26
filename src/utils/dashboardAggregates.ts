import type { OTRecord, OTPeriodSummary, ChartPoint } from "@/types/ot";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { th } from "date-fns/locale";
import { toDateKey } from "./dateHelpers";

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

export function yearChartData(
  records: OTRecord[],
  yearStart: Date,
): ChartPoint[] {
  const byDate = indexByDate(records);

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDate = addMonths(yearStart, monthIndex);
    const start = startOfMonth(monthDate);
    const label = format(start, "MMM", { locale: th });
    const prefix = format(start, "yyyy-MM");
    let amount = 0;

    for (const [key, record] of byDate) {
      if (key.startsWith(prefix)) {
        amount += record.otAmount;
      }
    }

    return {
      key: prefix,
      label,
      amount,
    };
  });
}

function indexByDate(records: OTRecord[]): Map<string, OTRecord> {
  return new Map(records.map((record) => [record.workDate, record]));
}
