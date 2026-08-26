"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Settings } from "lucide-react";
import { LogoMark } from "@/components/ui/PageHeader";

const ITEMS = [
  { href: "/", label: "ปฏิทิน", icon: CalendarDays },
  { href: "/dashboard", label: "สรุป", icon: LayoutDashboard },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="หลัก"
      className="fixed inset-x-3 bottom-3 z-40 rounded-full bg-[var(--surface)] text-[var(--text)] shadow-[0_12px_30px_rgba(28,20,80,0.18)] md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-3 px-2">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full ${
                    active ? "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]" : ""
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="หลัก"
      className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col p-5 text-[var(--on-background)] md:flex"
    >
      <div className="mb-8 flex items-center gap-3 px-1">
        <LogoMark size="sm" />
        <div>
          <p className="font-semibold">OT Calculator</p>
          <p className="text-xs text-[color-mix(in_srgb,var(--on-background)_70%,transparent)]">
            ค่าล่วงเวลา
          </p>
        </div>
      </div>
      {ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mb-1 flex min-h-11 items-center gap-3 rounded-full px-3 text-sm font-medium ${
              active
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[color-mix(in_srgb,var(--on-background)_75%,transparent)] hover:bg-[color-mix(in_srgb,var(--on-background)_10%,transparent)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
