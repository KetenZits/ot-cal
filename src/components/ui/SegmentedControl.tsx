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
  const many = options.length > 3;

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`grid bg-[var(--surface)] p-1 text-[var(--text)] shadow-[0_12px_30px_rgba(28,20,80,0.12)] ${
        many
          ? "grid-cols-2 gap-1 rounded-[24px] sm:grid-cols-4 sm:gap-0 sm:rounded-full"
          : "grid-cols-3 rounded-full"
      }`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`min-h-11 rounded-full px-1 text-sm font-semibold transition-colors ${
              selected
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
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
