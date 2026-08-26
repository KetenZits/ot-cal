import {
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

export function getYearRange(date: Date): { start: Date; end: Date } {
  return { start: startOfYear(date), end: endOfYear(date) };
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
