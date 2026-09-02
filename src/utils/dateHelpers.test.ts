import { describe, expect, it } from "vitest";
import { getOtPeriodRange, getOtYearBucketRange, getOtYearRange, toDateKey } from "./dateHelpers";

describe("getOtPeriodRange", () => {
  it("uses the calendar month when start is 1 and end is 31", () => {
    const range = getOtPeriodRange(new Date(2026, 7, 10), 1, 31);
    expect(toDateKey(range.start)).toBe("2026-08-01");
    expect(toDateKey(range.end)).toBe("2026-08-31");
  });

  it("uses previous 26th to current 26th when both days are 26", () => {
    const range = getOtPeriodRange(new Date(2026, 7, 10), 26, 26);
    expect(toDateKey(range.start)).toBe("2026-07-26");
    expect(toDateKey(range.end)).toBe("2026-08-26");
  });

  it("uses previous 26th to current 25th when start is after end", () => {
    const range = getOtPeriodRange(new Date(2026, 7, 10), 26, 25);
    expect(toDateKey(range.start)).toBe("2026-07-26");
    expect(toDateKey(range.end)).toBe("2026-08-25");
  });

  it("uses the same month when start is before end", () => {
    const range = getOtPeriodRange(new Date(2026, 7, 10), 5, 20);
    expect(toDateKey(range.start)).toBe("2026-08-05");
    expect(toDateKey(range.end)).toBe("2026-08-20");
  });

  it("clamps 31 in February", () => {
    const range = getOtPeriodRange(new Date(2026, 1, 10), 31, 31);
    expect(toDateKey(range.start)).toBe("2026-01-31");
    expect(toDateKey(range.end)).toBe("2026-02-28");
  });
});

describe("getOtYearRange", () => {
  it("spans December previous year to December this year for 26–26", () => {
    const range = getOtYearRange(new Date(2026, 5, 1), 26, 26);
    expect(toDateKey(range.start)).toBe("2025-12-26");
    expect(toDateKey(range.end)).toBe("2026-12-26");
  });

  it("uses the calendar year when start is 1 and end is 31", () => {
    const range = getOtYearRange(new Date(2026, 5, 1), 1, 31);
    expect(toDateKey(range.start)).toBe("2026-01-01");
    expect(toDateKey(range.end)).toBe("2026-12-31");
  });
});

describe("getOtYearBucketRange", () => {
  it("keeps both 26ths in January and starts later months on the 27th", () => {
    const january = getOtYearBucketRange(new Date(2026, 0, 1), 26, 26, 0);
    expect(toDateKey(january.start)).toBe("2025-12-26");
    expect(toDateKey(january.end)).toBe("2026-01-26");

    const february = getOtYearBucketRange(new Date(2026, 1, 1), 26, 26, 1);
    expect(toDateKey(february.start)).toBe("2026-01-27");
    expect(toDateKey(february.end)).toBe("2026-02-26");
  });
});
