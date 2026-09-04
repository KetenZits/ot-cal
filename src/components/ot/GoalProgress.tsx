import { formatBaht, formatOTHours } from "@/utils/format";

interface GoalProgressProps {
  current: number;
  goal: number;
  hourlyRate?: number;
  variant?: "default" | "banner";
}

export function GoalProgress({
  current,
  goal,
  hourlyRate = 0,
  variant = "default",
}: GoalProgressProps) {
  if (!(goal > 0)) return null;

  const ratio = Math.min(1, current / goal);
  const remaining = Math.max(0, goal - current);
  const over = Math.max(0, current - goal);
  const hit = remaining <= 0.004;
  const remainingMinutes =
    !hit && hourlyRate > 0 ? Math.round((remaining / hourlyRate) * 60) : 0;

  const muted = variant === "banner" ? "text-[var(--banner-muted)]" : "text-[var(--text-muted)]";
  const track =
    variant === "banner"
      ? "bg-[color-mix(in_srgb,var(--banner-ink)_18%,transparent)]"
      : "bg-[color-mix(in_srgb,var(--text)_12%,transparent)]";
  const fill = variant === "banner" ? "bg-[var(--banner-ink)]" : "bg-[var(--accent)]";

  let status: string;
  if (over > 0.004) {
    status = `เกินเป้า ${formatBaht(over)}`;
  } else if (hit) {
    status = "ถึงเป้าแล้ว";
  } else if (remainingMinutes > 0) {
    status = `เหลือ ${formatBaht(remaining)} · ~${formatOTHours(remainingMinutes)} ชม.`;
  } else {
    status = `เหลือ ${formatBaht(remaining)}`;
  }

  return (
    <div className="mt-3">
      <div className={`flex items-center justify-between gap-3 text-xs ${muted}`}>
        <span>เป้า {formatBaht(goal)}</span>
        <span className="text-right">{status}</span>
      </div>
      <div className={`mt-1.5 h-2 overflow-hidden rounded-full ${track}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
          style={{ width: `${Math.max(hit ? 100 : ratio * 100, 0)}%` }}
        />
      </div>
    </div>
  );
}
