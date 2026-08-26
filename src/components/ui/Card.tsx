export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] bg-[var(--surface)] p-4 text-[var(--text)] shadow-[0_18px_40px_rgba(28,20,80,0.12)] ${className}`}
    >
      {children}
    </section>
  );
}
