import { describe, expect, it } from "vitest";
import { calculateOT } from "./otCalculator";

describe("calculateOT", () => {
  const hourlyRate = 75;
  const normalEndTime = "17:00";

  it("returns 0 when actual end equals normal end", () => {
    expect(
      calculateOT({
        normalEndTime,
        actualEndTime: "17:00",
        hourlyRate,
      }),
    ).toEqual({ otMinutes: 0, otAmount: 0 });
  });

  it("returns 30 minutes and 37.50 baht for 17:30", () => {
    expect(
      calculateOT({
        normalEndTime,
        actualEndTime: "17:30",
        hourlyRate,
      }),
    ).toEqual({ otMinutes: 30, otAmount: 37.5 });
  });

  it("returns 60 minutes for 18:00", () => {
    expect(
      calculateOT({
        normalEndTime,
        actualEndTime: "18:00",
        hourlyRate,
      }),
    ).toEqual({ otMinutes: 60, otAmount: 75 });
  });

  it("returns 210 minutes for 20:30", () => {
    expect(
      calculateOT({
        normalEndTime,
        actualEndTime: "20:30",
        hourlyRate,
      }),
    ).toEqual({ otMinutes: 210, otAmount: 262.5 });
  });

  it("never returns negative OT when actual end is earlier", () => {
    expect(
      calculateOT({
        normalEndTime: "18:00",
        actualEndTime: "17:00",
        hourlyRate,
      }),
    ).toEqual({ otMinutes: 0, otAmount: 0 });
  });

  it("handles 08:00, 17:30, 23:45 without overnight logic", () => {
    expect(
      calculateOT({
        normalEndTime: "08:00",
        actualEndTime: "17:30",
        hourlyRate,
      }).otMinutes,
    ).toBe(570);

    expect(
      calculateOT({
        normalEndTime: "17:00",
        actualEndTime: "23:45",
        hourlyRate,
      }).otMinutes,
    ).toBe(405);
  });

  it("keeps otMinutes as an integer and does not round duration", () => {
    const result = calculateOT({
      normalEndTime: "17:00",
      actualEndTime: "17:07",
      hourlyRate,
    });
    expect(Number.isInteger(result.otMinutes)).toBe(true);
    expect(result.otMinutes).toBe(7);
  });
});
