import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Github,
  Globe,
  Inbox,
  Layers,
  PencilLine,
  SquareStack,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CompletenessRing, CompletenessChecklist, buildCompleteness } from "@/components/dashboard/completeness";
import { Flash } from "@/components/dashboard/flash";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { CopyButton } from "@/components/ui/copy-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { setPublishedAction } from "@/app/actions/portfolio";
import { relativeTime } from "@/lib/utils";

const CHECK_ROUTES: Record<string, string> = {
  title: "/dashboard/profile",
  headline: "/dashboard/profile",
  bio: "/dashboard/profile",
  email: "/dashboard/profile",
  avatar: "/dashboard/profile",
  social: "/dashboard/content#links",
  projects: "/dashboard/projects",
  skills: "/dashboard/content#skills",
  experience: "/dashboard/content#experience",
  education: "/dashboard/content#education",
  certifications: "/dashboard/content#achievements",
};

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard/wizard");

  const completenessResult = buildCompleteness({
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
  });

  const nextCheck = completenessResult.checks.find((check) => !check.done);
  const publicUrl = `/u/${portfolio.slug}`;
  const unread = portfolio.messages.filter((message) => !message.read).length;
  const liveProjects = portfolio.projects.filter((project) => project.status === "live").length;

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Everything about your portfolio in one place: publication state, completeness and the work still to do."
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/preview" className={buttonClasses("secondary", "sm")}>
              <Eye className="size-3.5" aria-hidden />
              Preview
            </Link>
            {portfolio.published ? (
              <Link href={publicUrl} className={buttonClasses("primary", "sm")}>
                View live
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            ) : (
              <form action={setPublishedAction}>
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="published" value="true" />
                <input type="hidden" name="redirectTo" value="/dashboard" />
                <SubmitButton size="sm" pendingLabel="Publishing…">
                  <Globe className="size-3.5" aria-hidden />
                  Publish now
                </SubmitButton>
              </form>
            )}
          </div>
        }
      />

      {params.denied && <Flash tone="error" message="You do not have permission to access that portfolio." />}
      {params.saved && <Flash message="Changes saved." />}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={portfolio.published ? "live" : "planned"} />
                <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted uppercase">
                  {portfolio.published ? "Public" : "Private draft"}
                </span>
              </div>
              <h2 className="mt-3 text-[16px] font-medium">{portfolio.title || "Untitled portfolio"}</h2>
              <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
                {portfolio.published
                  ? "Anyone with the link can read the sections you enabled. Changes go live immediately."
                  : "Only you can see this portfolio. Publish it to get a shareable URL."}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-line bg-ink px-3 py-2">
                <span className="max-w-[220px] truncate font-mono text-[11px] text-text-2">
                  {portfolio.published ? `/u/${portfolio.slug}` : "not published"}
                </span>
                {portfolio.published && <CopyButton value={publicUrl} label="" className="h-6 px-1.5" />}
              </div>
              <form action={setPublishedAction}>
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="published" value={portfolio.published ? "false" : "true"} />
                <input type="hidden" name="redirectTo" value="/dashboard" />
                <SubmitButton
                  variant={portfolio.published ? "ghost" : "secondary"}
                  size="sm"
                  pendingLabel={portfolio.published ? "Unpublishing…" : "Publishing…"}
                >
                  {portfolio.published ? "Unpublish" : "Publish portfolio"}
                </SubmitButton>
              </form>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
            {[
              { label: "Projects", value: portfolio.projects.length },
              { label: "Live", value: liveProjects },
              { label: "Skills", value: portfolio.skills.length },
              { label: "Unread", value: unread },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink px-3 py-2.5">
                <p className="font-mono text-[8.5px] tracking-[0.1em] text-muted uppercase">{stat.label}</p>
                <p className="mt-1 text-[15px] font-medium text-text">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Profile completeness</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Weighted across the details visitors look for. Nothing here is scored against other users.
              </p>
            </div>
            <CompletenessRing score={completenessResult.score} />
          </div>
          <div className="mt-4">
            <CompletenessChecklist checks={completenessResult.checks} />
          </div>
          {nextCheck && (
            <Link
              href={CHECK_ROUTES[nextCheck.id] ?? "/dashboard/wizard"}
              className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] text-mint transition-colors hover:text-[#a3e6d8]"
            >
              Next: {nextCheck.label}
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-medium">Quick actions</h2>
            <Layers className="size-4 text-muted/60" aria-hidden />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { href: "/dashboard/projects", label: "Manage projects", icon: SquareStack },
              { href: "/dashboard/appearance", label: "Change template", icon: Layers },
              { href: "/dashboard/github", label: "Sync GitHub", icon: Github },
              { href: "/dashboard/profile", label: "Edit profile", icon: PencilLine },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-2.5 rounded-lg border border-line bg-ink px-3 py-2.5 text-[11.5px] text-text-2 transition-colors hover:border-line-strong hover:text-text"
                >
                  <Icon className="size-3.5 text-muted transition-colors group-hover:text-mint" aria-hidden />
                  {action.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-line bg-ink p-3">
            <p className="font-mono text-[8.5px] tracking-[0.12em] text-muted uppercase">GitHub integration</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="text-[11.5px] text-text-2">
                {portfolio.github
                  ? `@${portfolio.github.username} · ${portfolio.github.lastSyncedAt ? relativeTime(portfolio.github.lastSyncedAt) : "never synced"}`
                  : "Not connected"}
              </p>
              <Link href="/dashboard/github" className="text-[10.5px] text-mint hover:text-[#a3e6d8]">
                Open
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-medium">Recent activity</h2>
            <CheckCircle2 className="size-4 text-muted/60" aria-hidden />
          </div>
          {portfolio.activity.length ? (
            <ul className="mt-3 divide-y divide-line">
              {portfolio.activity.map((entry) => (
                <li key={entry.id} className="flex items-baseline justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-[11.5px] text-text-2">{entry.detail}</p>
                    <p className="mt-0.5 font-mono text-[8.5px] tracking-[0.08em] text-muted uppercase">{entry.action}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] text-muted">{relativeTime(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-line p-4 text-[11.5px] text-muted">
              No activity yet. Save a section or sync GitHub to see entries here.
            </p>
          )}

          <Link href="/dashboard/inbox" className="mt-4 flex items-center justify-between rounded-lg border border-line bg-ink px-3 py-2.5 transition-colors hover:border-line-strong">
            <span className="flex items-center gap-2 text-[11.5px] text-text-2">
              <Inbox className="size-3.5 text-muted" aria-hidden />
              Contact inbox
            </span>
            <span className="flex items-center gap-2">
              {unread > 0 && <span className="rounded-full bg-mint/15 px-1.5 py-0.5 font-mono text-[9px] text-mint">{unread} new</span>}
              <ArrowRight className="size-3 text-muted" aria-hidden />
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-line px-5 py-4">
        <p className="text-[11.5px] leading-relaxed text-muted">
          Not sure where to start? The builder walks through ten steps and lets you skip anything optional.
        </p>
        <Link href="/dashboard/wizard" className={buttonClasses("secondary", "sm")}>
          Open the builder
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
