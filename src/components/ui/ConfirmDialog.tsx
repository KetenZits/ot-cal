"use client";

import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  danger = false,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <BottomSheet open={open} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      <div className="flex flex-col gap-2">
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "กำลังดำเนินการ..." : confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
      </div>
    </BottomSheet>
  );
}
