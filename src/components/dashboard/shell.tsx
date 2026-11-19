"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Eye,
  Github,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Palette,
  Settings,
  Shield,
  Sparkles,
  SquareStack,
  X,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/logo";
import { signOutAction } from "@/app/actions/auth";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/wizard", label: "Builder", icon: Sparkles },
  { href: "/dashboard/projects", label: "Projects", icon: SquareStack },
  { href: "/dashboard/content", label: "Content", icon: LayoutTemplate },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/github", label: "GitHub", icon: Github },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/preview", label: "Preview", icon: Eye },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface ShellProps {
  user: { name: string; email: string; role: "USER" | "OWNER" };
  portfolio: { slug: string; published: boolean; title: string; template: string } | null;
  unread: number;
  children: React.ReactNode;
}

export function DashboardShell({ user, portfolio, unread, children }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-0.5" aria-label="Dashboard">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors",
              active ? "bg-white/[0.06] text-text" : "text-muted hover:bg-white/[0.035] hover:text-text-2",
            )}
          >
            <Icon className={cn("size-4", active ? "text-mint" : "text-muted/80")} aria-hidden />
            <span className="flex-1">{item.label}</span>
            {item.label === "Inbox" && unread > 0 && (
              <span className="rounded-full bg-mint/15 px-1.5 py-0.5 font-mono text-[9px] text-mint">{unread}</span>
            )}
          </Link>
        );
      })}

      {user.role === "OWNER" && (
        <>
          <div className="my-3 h-px bg-line" />
          <p className="px-2.5 pb-1 font-mono text-[8.5px] tracking-[0.14em] text-muted/70 uppercase">Owner</p>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors",
              pathname.startsWith("/admin") ? "bg-white/[0.06] text-text" : "text-muted hover:bg-white/[0.035] hover:text-text-2",
            )}
          >
            <Shield className="size-4 text-sand/80" aria-hidden />
            Admin console
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-ink">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur md:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          {portfolio?.published && (
            <Link href={`/u/${portfolio.slug}`} className="rounded-md p-2 text-muted hover:text-text" aria-label="View public portfolio">
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open dashboard menu"
            className="rounded-md p-2 text-muted hover:bg-white/[0.05] hover:text-text"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-ink/85 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[280px] overflow-y-auto border-l border-line bg-surface p-4">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-1.5 text-muted hover:text-text">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mt-6">{nav}</div>
            <SignOut name={user.name} email={user.email} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-line bg-ink-2 px-4 py-5 md:flex">
        <Logo subtitle={portfolio?.published ? "published" : "draft"} />
        <div className="mt-7 flex-1 overflow-y-auto">{nav}</div>

        {portfolio && (
          <div className="mb-3 rounded-lg border border-line bg-white/[0.02] p-3">
            <p className="font-mono text-[8.5px] tracking-[0.12em] text-muted uppercase">Public URL</p>
            {portfolio.published ? (
              <Link href={`/u/${portfolio.slug}`} className="mt-1 flex items-center gap-1 truncate text-[11px] text-mint hover:text-[#a3e6d8]">
                /u/{portfolio.slug}
                <ArrowUpRight className="size-3 shrink-0" aria-hidden />
              </Link>
            ) : (
              <p className="mt-1 text-[11px] text-muted">Not published yet</p>
            )}
          </div>
        )}

        <SignOut name={user.name} email={user.email} />
      </aside>

      <div className="md:pl-[248px]">
        <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}

function SignOut({ name, email }: { name: string; email: string }) {
  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.04] text-[11px] font-medium text-text-2">
        {initials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11.5px] text-text">{name}</p>
        <p className="truncate text-[10px] text-muted">{email}</p>
      </div>
      <form action={signOutAction}>
        <button type="submit" aria-label="Sign out" className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/[0.05] hover:text-danger">
          <LogOut className="size-3.5" aria-hidden />
        </button>
      </form>
    </div>
  );
}
