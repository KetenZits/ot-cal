import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, hint, id, className = "", ...props }, ref) {
    const inputId = id ?? props.name;

    return (
      <label className="flex w-full flex-col gap-1.5 text-sm" htmlFor={inputId}>
        {label ? (
          <span className="font-medium text-[var(--text)]">{label}</span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`min-h-12 w-full rounded-2xl border-0 bg-[color-mix(in_srgb,var(--text)_6%,var(--surface))] px-4 text-base text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] ${className}`}
          {...props}
        />
        {hint ? (
          <span className="text-xs text-[var(--text-muted)]">{hint}</span>
        ) : null}
      </label>
    );
  },
);
