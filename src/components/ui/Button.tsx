import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "ui-button-primary bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90",
  secondary:
    "border border-[color-mix(in_srgb,var(--text)_16%,transparent)] bg-[color-mix(in_srgb,var(--text)_8%,var(--surface))] text-[var(--text)] hover:opacity-90",
  ghost:
    "bg-[color-mix(in_srgb,var(--on-background)_12%,transparent)] text-[var(--on-background)] hover:bg-[color-mix(in_srgb,var(--on-background)_20%,transparent)]",
  danger: "ui-button-primary bg-[#ef4444] text-white hover:bg-[#dc2626]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", className = "", type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={`ui-button inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
        {...props}
      />
    );
  },
);
