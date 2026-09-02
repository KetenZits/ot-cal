import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  setDate,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns";
import { th } from "date-fns/locale";

export const WEEK_STARTS_ON = 1 as const;

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(key: string): Date {
  return parseISO(key);
}

export function getCalendarGridRange(month: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON }),
  };
}

export function getCalendarDays(month: Date): Date[] {
  const { start, end } = getCalendarGridRange(month);
  return eachDayOfInterval({ start, end });
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
    end: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

function dateWithDay(month: Date, day: number): Date {
  const base = startOfMonth(month);
  const last = endOfMonth(base).getDate();
  return setDate(base, Math.min(Math.max(Math.trunc(day), 1), last));
}

/**
 * OT counting period for a given calendar month.
 * - 1 to 31 → 1st through last day of that month
 * - 26 to 26 → 26th of previous month through 26th of this month
 * - 26 to 25 → 26th of previous month through 25th of this month
 */
export function getOtPeriodRange(
  month: Date,
  startDay: number,
  endDay: number,
): { start: Date; end: Date } {
  const startD = Math.min(31, Math.max(1, Math.trunc(startDay) || 1));
  const endD = Math.min(31, Math.max(1, Math.trunc(endDay) || 31));

  if (startD < endD) {
    return {
      start: dateWithDay(month, startD),
      end: dateWithDay(month, endD),
    };
  }

  return {
    start: dateWithDay(subMonths(month, 1), startD),
    end: dateWithDay(month, endD),
  };
}

export function formatPeriodRange(start: Date, end: Date): string {
  return `${format(start, "d MMM", { locale: th })} – ${format(end, "d MMM yyyy", { locale: th })}`;
}

export function isInInclusiveRange(day: Date, start: Date, end: Date): boolean {
  const key = toDateKey(day);
  return key >= toDateKey(start) && key <= toDateKey(end);
}

export function unionDateRange(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
): { start: Date; end: Date } {
  return {
    start: toDateKey(a.start) <= toDateKey(b.start) ? a.start : b.start,
    end: toDateKey(a.end) >= toDateKey(b.end) ? a.end : b.end,
  };
}

export function getYearRange(date: Date): { start: Date; end: Date } {
  return { start: startOfYear(date), end: endOfYear(date) };
}

/** All OT cycles that close in this calendar year. */
export function getOtYearRange(
  year: Date,
  startDay: number,
  endDay: number,
): { start: Date; end: Date } {
  const jan = startOfYear(year);
  const dec = new Date(jan.getFullYear(), 11, 1);
  return {
    start: getOtPeriodRange(jan, startDay, endDay).start,
    end: getOtPeriodRange(dec, startDay, endDay).end,
  };
}

/**
 * Non-overlapping slice of a cycle for yearly charts.
 * When start and end are the same day (e.g. 26–26), January keeps both 26ths
 * and later months start the day after so bars do not double-count.
 */
export function getOtYearBucketRange(
  month: Date,
  startDay: number,
  endDay: number,
  monthIndex: number,
): { start: Date; end: Date } {
  const range = getOtPeriodRange(month, startDay, endDay);
  if (startDay === endDay && monthIndex > 0) {
    return { start: addDays(range.start, 1), end: range.end };
  }
  return range;
}

export function shiftMonth(month: Date, offset: number): Date {
  return offset >= 0 ? addMonths(month, offset) : subMonths(month, Math.abs(offset));
}

export function formatMonthTitle(date: Date): string {
  return format(date, "MMMM yyyy", { locale: th });
}

export function formatFullDate(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: th });
}

export function formatWeekdayShort(date: Date): string {
  return format(date, "EEEEEE", { locale: th });
}

export function formatMonthShort(date: Date): string {
  return format(date, "MMM", { locale: th });
}

export function normalizeTime(value: string): string {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return value;
  }
  return `${match[1]}:${match[2]}`;
}

export function isCurrentMonth(day: Date, month: Date): boolean {
  return isSameMonth(day, month);
}

export { isSameDay, isToday };
