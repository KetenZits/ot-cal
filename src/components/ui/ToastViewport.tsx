"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";

export function ToastViewport() {
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed top-[max(0.75rem,env(safe-area-inset-top))] right-3 left-3 z-[60] mx-auto flex max-w-md flex-col gap-2 md:left-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-left text-sm shadow-lg ${
              toast.type === "error"
                ? "bg-[#ef4444] text-white"
                : toast.type === "success"
                  ? "bg-[var(--accent)] text-[var(--on-accent)]"
                  : "bg-[var(--surface)] text-[var(--text)]"
            }`}
            onClick={() => dismissToast(toast.id)}
          >
            {toast.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
