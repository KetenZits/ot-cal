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
      className={`ui-nav grid p-1 ${
        many ? "grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-0" : "grid-cols-3"
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
            className={`ui-button min-h-11 px-1 text-sm ${
              selected
                ? "ui-button-primary bg-[var(--accent)] text-[var(--on-accent)]"
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
