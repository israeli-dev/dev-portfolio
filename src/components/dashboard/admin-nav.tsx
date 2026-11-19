"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/users", label: "People" },
  { href: "/admin/system", label: "System" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="shell flex gap-1 overflow-x-auto pb-2">
      {TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-[11.5px] transition-colors",
              active ? "bg-white/[0.07] text-text" : "text-muted hover:bg-white/[0.035] hover:text-text-2",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
