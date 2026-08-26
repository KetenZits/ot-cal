import { Clock3 } from "lucide-react";

export function Spinner({ label = "กำลังโหลดข้อมูล..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--text-muted)]" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent)]" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  message = "ยังไม่มีรายการ OT",
  hint = "แตะวันที่ในปฏิทินเพื่อบันทึกเวลาเลิกงาน",
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-[28px] bg-[var(--surface)] px-5 py-12 text-center text-[var(--text)]">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]">
        <Clock3 size={22} aria-hidden="true" />
      </span>
      <p className="font-medium">{message}</p>
      <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">{hint}</p>
    </div>
  );
}

export function ErrorState({
  message = "ไม่สามารถโหลดข้อมูลได้",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-[var(--surface)] px-4 py-10 text-center">
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-xl px-4 text-sm font-semibold text-[var(--accent)]"
        >
          ลองใหม่อีกครั้ง
        </button>
      ) : null}
    </div>
  );
}
