"use client";

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid grid-cols-3 rounded-full bg-[var(--surface)] p-1 text-[var(--text)] shadow-[0_12px_30px_rgba(28,20,80,0.12)]"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`min-h-11 rounded-full text-sm font-semibold transition-colors ${
              selected
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)]"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
