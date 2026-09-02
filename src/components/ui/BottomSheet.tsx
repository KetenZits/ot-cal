"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label="ปิด"
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="ui-surface relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-[var(--radius-sheet)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:max-w-md md:rounded-[var(--radius-sheet)]"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="sheet-title" className="text-lg font-semibold">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="ui-button inline-flex h-11 w-11 items-center justify-center hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)]"
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
