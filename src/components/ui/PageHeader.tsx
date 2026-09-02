export function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";
  return (
    <span
      className={`ui-chip inline-flex ${box} items-center justify-center bg-[var(--accent)] font-bold tracking-tight text-[var(--on-accent)]`}
      aria-hidden="true"
    >
      OT
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <header className={`mb-5 ${className}`}>
      {eyebrow ? (
        <p className="text-[11px] font-medium tracking-[0.22em] text-[color-mix(in_srgb,var(--on-background)_70%,transparent)] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="ui-title mt-1 text-[1.75rem] leading-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-1.5 text-sm leading-6 text-[color-mix(in_srgb,var(--on-background)_72%,transparent)]">{subtitle}</p>
      ) : null}
    </header>
  );
}
