export function formatBaht(amount: number): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `฿${formatted}`;
}

export function formatCompactBaht(amount: number): string {
  const rounded = Math.round(amount);
  if (Math.abs(amount - rounded) < 0.005) {
    return `฿${rounded.toLocaleString("en-US")}`;
  }
  return formatBaht(amount);
}

export function formatOTDuration(minutes: number): string {
  if (minutes <= 0) {
    return "0 นาที";
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining} นาที`;
  }
  if (remaining === 0) {
    return `${hours} ชั่วโมง`;
  }
  return `${hours} ชั่วโมง ${remaining} นาที`;
}

export function formatOTHours(minutes: number): string {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return String(hours);
  }
  return hours.toFixed(1).replace(/\.0$/, "");
}

export function parseNumeric(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}
