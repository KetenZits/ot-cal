export interface OTRecord {
  id: number;
  workDate: string;
  endTime: string;
  otMinutes: number;
  otAmount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OTRecordInput {
  workDate: string;
  endTime: string;
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
}

export type DashboardPeriod = "week" | "month" | "year";

export interface ChartPoint {
  key: string;
  label: string;
  amount: number;
}
