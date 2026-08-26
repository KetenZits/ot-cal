import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-[0_10px_20px_color-mix(in_srgb,var(--accent)_35%,transparent)] hover:opacity-90",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] shadow-sm hover:opacity-90",
  ghost:
    "bg-[color-mix(in_srgb,var(--on-background)_12%,transparent)] text-[var(--on-background)] hover:bg-[color-mix(in_srgb,var(--on-background)_20%,transparent)]",
  danger: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className = "", type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
        {...props}
      />
    );
  },
);
