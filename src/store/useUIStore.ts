import { create } from "zustand";
import type { BeforeInstallPromptEvent } from "@/types/pwa";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  toasts: Toast[];
  installPromptEvent: BeforeInstallPromptEvent | null;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  installPromptEvent: null,
  showToast: (message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 3500);
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  setInstallPromptEvent: (event) => set({ installPromptEvent: event }),
}));
