export interface CalculateOTInput {
  normalEndTime: string;
  actualEndTime: string;
  hourlyRate: number;
}

export interface CalculateOTResult {
  otMinutes: number;
  otAmount: number;
}

function timeToMinutes(time: string): number {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    throw new Error(`Invalid time: ${time}`);
  }

  return hours * 60 + minutes;
}

/**
 * Pure OT calculation.
 * Converts HH:mm to minutes-from-midnight, never returns negative OT,
 * and stores money using satang (1/100 baht) rounding.
 */
export function calculateOT({
  normalEndTime,
  actualEndTime,
  hourlyRate,
}: CalculateOTInput): CalculateOTResult {
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
    throw new Error("hourlyRate must be a non-negative finite number");
  }

  const otMinutes = Math.max(
    0,
    timeToMinutes(actualEndTime) - timeToMinutes(normalEndTime),
  );

  const rateSatang = Math.round(hourlyRate * 100);
  const satang = Math.round((otMinutes * rateSatang) / 60);
  const otAmount = satang / 100;

  return { otMinutes, otAmount };
}
