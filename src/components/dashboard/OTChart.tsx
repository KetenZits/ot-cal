"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint, DashboardPeriod } from "@/types/ot";
import { formatBaht } from "@/utils/format";

interface OTChartProps {
  data: ChartPoint[];
  period: DashboardPeriod;
}

export function OTChart({ data, period }: OTChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} key={period} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => String(Math.round(value))}
          />
          <Tooltip
            cursor={{ fill: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="amount"
            fill="var(--accent)"
            radius={[8, 8, 0, 0]}
            isAnimationActive
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  return (
    <div className="rounded-xl bg-[var(--background)] px-3 py-2 text-sm shadow-lg">
      <p className="text-[var(--text-muted)]">{label}</p>
      <p className="font-semibold text-[var(--accent)]">{formatBaht(payload[0].value)}</p>
    </div>
  );
}
