import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { PortfolioRow, UserRow } from "@/lib/rows";

export const metadata = { title: "People" };

export default async function AdminUsers() {
  const users = (await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      portfolios: {
        select: { id: true, slug: true, published: true, updatedAt: true, title: true, _count: { select: { projects: true } } },
      },
    },
  })) as (UserRow & {
    portfolios: (PortfolioRow & { title: string; _count: { projects: number } })[];
  })[];

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Accounts and portfolios"
        description="Read-only oversight of every account. Personal contact details of other users are intentionally not exposed beyond what they chose to publish."
      />

      {users.length === 0 ? (
        <EmptyState title="No accounts yet" description="Sign-ups will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="hidden grid-cols-[1.2fr_1fr_120px_120px] gap-3 border-b border-line bg-white/[0.02] px-4 py-2.5 font-mono text-[8.5px] tracking-[0.1em] text-muted uppercase sm:grid">
            <span>Account</span>
            <span>Portfolio</span>
            <span>State</span>
            <span>Joined</span>
          </div>
          {users.map((user) => {
            const portfolio = user.portfolios[0];
            return (
              <div key={user.id} className="grid gap-2 border-b border-line px-4 py-3 last:border-0 sm:grid-cols-[1.2fr_1fr_120px_120px] sm:items-center">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-[12px] text-text">
                    {user.name}
                    {user.role === "OWNER" && (
                      <span className="rounded-full border border-sand/25 bg-sand/10 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.08em] text-sand uppercase">owner</span>
                    )}
                  </p>
                  <p className="truncate text-[10.5px] text-muted">{user.email}</p>
                </div>
                <div className="min-w-0">
                  {portfolio ? (
                    <Link href={`/u/${portfolio.slug}`} className="truncate font-mono text-[10.5px] text-text-2 hover:text-mint">
                      /u/{portfolio.slug}
                      <span className="ml-1.5 text-muted">({portfolio._count.projects} projects)</span>
                    </Link>
                  ) : (
                    <span className="text-[10.5px] text-muted">none</span>
                  )}
                </div>
                <div>{portfolio ? <StatusBadge status={portfolio.published ? "live" : "planned"} size="sm" /> : <span className="text-[10px] text-muted">—</span>}</div>
                <span className="font-mono text-[9.5px] text-muted">{formatDate(user.createdAt, { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-[10.5px] leading-relaxed text-muted">
        Account deletion is self-service from each user&apos;s settings page. Admin impersonation is deliberately not implemented.
      </p>
    </div>
  );
}
