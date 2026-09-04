export type DayKind = "ot" | "off" | "absent";

export interface OTRecord {
  id: number;
  workDate: string;
  endTime: string;
  otMinutes: number;
  otAmount: number;
  dayKind: DayKind;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OTRecordInput {
  workDate: string;
  endTime?: string;
  dayKind?: DayKind;
  note?: string | null;
}

export interface OTCalculation {
  otMinutes: number;
  otAmount: number;
}

export interface OTPeriodSummary {
  totalOTMinutes: number;
  totalOTHours: number;
  totalOTAmount: number;
  otDays: number;
  offDays: number;
  absentDays: number;
}

export type DashboardPeriod = "week" | "month" | "year" | "custom";

export interface ChartPoint {
  key: string;
  label: string;
  amount: number;
}

export function getDayKind(record: Pick<OTRecord, "dayKind"> | null | undefined): DayKind {
  if (record?.dayKind === "off" || record?.dayKind === "absent") {
    return record.dayKind;
  }
  return "ot";
}

export const DAY_KIND_LABEL: Record<DayKind, string> = {
  ot: "OT",
  off: "หยุด",
  absent: "ไม่มา",
};
