import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Github, Globe, Inbox, Layers, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getOwnerPortfolio, getOwnerInbox } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CompletenessRing, CompletenessChecklist, buildCompleteness } from "@/components/dashboard/completeness";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { NEEDS_OWNER_INPUT } from "@/content/personal";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const user = await getCurrentUser();
  const owner = await getOwnerPortfolio();

  const [userCount, portfolioCount, publishedCount, projectCount, messageCount, recentActivity] = await Promise.all([
    db.user.count(),
    db.portfolio.count(),
    db.portfolio.count({ where: { published: true } }),
    db.project.count({ where: { excluded: false } }),
    db.contactMessage.count({ where: { read: false } }),
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const inbox = user ? await getOwnerInbox(user.id) : [];
  const portfolio = owner?.portfolio;
  const completenessResult = portfolio
    ? buildCompleteness({
        title: portfolio.title,
        headline: portfolio.headline,
        bio: portfolio.bio,
        email: portfolio.email,
        avatarUrl: portfolio.avatarUrl,
        socialLinks: portfolio.socialLinks.length,
        projects: portfolio.projects.length,
        skills: portfolio.skills.length,
        experiences: portfolio.experiences.length,
        education: portfolio.education.length,
        certifications: portfolio.certifications.length + portfolio.achievements.length,
      })
    : null;

  return (
    <div>
      <PageHeader
        eyebrow="Owner console"
        title="Platform overview"
        description="Administrative access is enforced on the server for every route and mutation — the buttons are not the security boundary."
        action={
          <Link href="/dashboard" className={buttonClasses("secondary", "sm")}>
            Edit portfolio
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Accounts" value={userCount} hint="Registered users" icon={<Users className="size-4" aria-hidden />} />
        <StatCard label="Portfolios" value={portfolioCount} hint={`${publishedCount} published`} icon={<Layers className="size-4" aria-hidden />} />
        <StatCard label="Projects" value={projectCount} hint="Across all portfolios" icon={<Globe className="size-4" aria-hidden />} />
        <StatCard label="Unread messages" value={messageCount} tone={messageCount ? "sand" : "default"} hint="Contact inbox" icon={<Inbox className="size-4" aria-hidden />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-medium">Featured portfolio</h2>
              <p className="mt-1 text-[11.5px] text-muted">
                {portfolio ? `/${portfolio.slug} · ${portfolio.published ? "published" : "draft"} · ${portfolio.template} template` : "No owner portfolio found"}
              </p>
            </div>
            {portfolio && <StatusBadge status={portfolio.published ? "live" : "planned"} />}
          </div>

          {portfolio ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href="/dashboard/projects" className={buttonClasses("secondary", "sm")}>Manage projects</Link>
                <Link href="/dashboard/github" className={buttonClasses("secondary", "sm")}>
                  <Github className="size-3.5" aria-hidden />
                  Sync GitHub
                </Link>
                <Link href={`/u/${portfolio.slug}`} className={buttonClasses("ghost", "sm")}>Public page</Link>
                <Link href="/" className={buttonClasses("ghost", "sm")}>Personal site</Link>
              </div>

              <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-[auto_1fr]">
                {completenessResult && <CompletenessRing score={completenessResult.score} />}
                <div className="grid gap-1 sm:grid-cols-2">
                  {completenessResult?.checks.slice(0, 8).map((check) => (
                    <CompletenessChecklist key={check.id} checks={[check]} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-[11.5px] text-muted">
              Run <code className="font-mono text-mint">npm run db:seed</code> to create the owner portfolio.
            </p>
          )}

          <div className="mt-5 rounded-lg border border-sand/25 bg-sand/[0.05] p-3.5">
            <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] text-sand uppercase">
              <AlertTriangle className="size-3" aria-hidden />
              Needs your input before launch
            </p>
            <ul className="mt-2 space-y-1.5">
              {NEEDS_OWNER_INPUT.map((item) => (
                <li key={item} className="flex gap-2 text-[11px] leading-relaxed text-text-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-sand/70" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-white/[0.02] p-5">
            <h2 className="text-[13px] font-medium">Recent activity</h2>
            {recentActivity.length ? (
              <ul className="mt-3 space-y-2.5">
                {recentActivity.map((entry) => (
                  <li key={entry.id} className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11px] text-text-2">{entry.detail}</span>
                    <span className="shrink-0 font-mono text-[8.5px] text-muted">{relativeTime(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[11px] text-muted">No activity recorded yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium">Latest messages</h2>
              <Link href="/dashboard/inbox" className="text-[10.5px] text-mint hover:text-[#a3e6d8]">Open inbox</Link>
            </div>
            {inbox.length ? (
              <ul className="mt-3 space-y-2">
                {inbox.slice(0, 3).map((message) => (
                  <li key={message.id} className="rounded-lg border border-line bg-ink px-2.5 py-2">
                    <p className="flex items-center justify-between gap-2 text-[11px] text-text-2">
                      <span className="truncate">{message.name}</span>
                      <span className="shrink-0 font-mono text-[8.5px] text-muted">{relativeTime(message.createdAt)}</span>
                    </p>
                    <p className="mt-0.5 truncate text-[10.5px] text-muted">{message.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[11px] text-muted">No messages yet. The contact form writes here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
