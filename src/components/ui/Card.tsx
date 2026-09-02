export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`ui-surface rounded-[var(--radius-card)] p-4 ${className}`}>
      {children}
    </section>
  );
}
