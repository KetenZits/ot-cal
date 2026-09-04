import { describe, expect, it } from "vitest";
import type { OTRecord } from "@/types/ot";
import { yearPeriodChartData, summarizeRecords } from "./dashboardAggregates";

function record(workDate: string, otAmount: number): OTRecord {
  return {
    id: 1,
    workDate,
    endTime: "20:00",
    otMinutes: 60,
    otAmount,
    dayKind: "ot",
    note: null,
    createdAt: "",
    updatedAt: "",
  };
}

describe("yearPeriodChartData", () => {
  it("puts overlapping 26ths into a single month bar", () => {
    const points = yearPeriodChartData(
      [record("2026-01-26", 100), record("2026-01-27", 40)],
      new Date(2026, 5, 1),
      26,
      26,
    );

    expect(points[0]?.amount).toBe(100);
    expect(points[1]?.amount).toBe(40);
  });
});

describe("summarizeRecords", () => {
  it("counts off and absent days separately from OT", () => {
    const summary = summarizeRecords([
      record("2026-09-01", 150),
      {
        ...record("2026-09-02", 0),
        otMinutes: 0,
        dayKind: "off",
      },
      {
        ...record("2026-09-03", 0),
        otMinutes: 0,
        dayKind: "absent",
      },
    ]);

    expect(summary.totalOTAmount).toBe(150);
    expect(summary.otDays).toBe(1);
    expect(summary.offDays).toBe(1);
    expect(summary.absentDays).toBe(1);
  });
});
