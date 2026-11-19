import Link from "next/link";
import { ArrowUpRight, Github, Pencil, Star } from "lucide-react";
import { getOwnerPortfolio } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { categoryLabel } from "@/lib/domain";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Portfolio" };

export default async function AdminPortfolio() {
  const owner = await getOwnerPortfolio();

  if (!owner) {
    return (
      <EmptyState
        title="No owner portfolio"
        description="Seed the database to create the featured portfolio."
        className="mt-10"
      />
    );
  }

  const { portfolio, owner: ownerUser } = owner;
  const excluded = portfolio.projects.filter((project) => project.excluded);

  return (
    <div>
      <PageHeader
        eyebrow="Owner portfolio"
        title={portfolio.title}
        description={`Owned by ${ownerUser.name} (${ownerUser.email}). Edits happen in the main dashboard; this view is for oversight.`}
        action={
          <div className="flex gap-2">
            <Link href="/dashboard" className={buttonClasses("secondary", "sm")}>Dashboard</Link>
            <Link href={`/u/${portfolio.slug}`} className={buttonClasses("primary", "sm")}>
              Public page
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Status", value: portfolio.published ? "Published" : "Draft" },
          { label: "Template", value: portfolio.template },
          { label: "Projects", value: portfolio.projects.filter((project) => !project.excluded).length },
          { label: "Excluded", value: excluded.length },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-white/[0.02] p-4">
            <p className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">{item.label}</p>
            <p className="mt-1.5 text-[15px] font-medium capitalize">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <div className="flex items-center justify-between border-b border-line bg-white/[0.02] px-4 py-2.5">
          <p className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">All projects</p>
          <Link href="/dashboard/github" className="inline-flex items-center gap-1.5 text-[10.5px] text-mint hover:text-[#a3e6d8]">
            <Github className="size-3" aria-hidden />
            Sync GitHub
          </Link>
        </div>
        {portfolio.projects.map((project) => (
          <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[12px] font-medium text-text">{project.name}</p>
                {project.featured && <Star className="size-3 fill-sand text-sand" aria-label="Featured" />}
                <StatusBadge status={project.status} size="sm" />
              </div>
              <p className="mt-0.5 truncate text-[10.5px] text-muted">
                {categoryLabel(project.category)} · {project.source} · {project.lastPushedAt ? `pushed ${relativeTime(project.lastPushedAt)}` : "no repo date"}
              </p>
            </div>
            <Link href={`/dashboard/projects/${project.id}`} className={buttonClasses("ghost", "sm")}>
              <Pencil className="size-3" aria-hidden />
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
