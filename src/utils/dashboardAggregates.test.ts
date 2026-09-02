import { describe, expect, it } from "vitest";
import type { OTRecord } from "@/types/ot";
import { yearPeriodChartData } from "./dashboardAggregates";

function record(workDate: string, otAmount: number): OTRecord {
  return {
    id: 1,
    workDate,
    endTime: "20:00",
    otMinutes: 60,
    otAmount,
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
