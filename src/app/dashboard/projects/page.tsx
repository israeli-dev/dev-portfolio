import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowUpRight, Github, Pencil, Plus, SquareStack, Star, Eye, EyeOff, Ban } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Flash } from "@/components/dashboard/flash";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { categoryLabel } from "@/lib/domain";
import { monogramGradient } from "@/lib/templates";
import { initials, relativeTime } from "@/lib/utils";
import { deleteProjectAction, toggleProjectFlagAction } from "@/app/actions/portfolio";

export const metadata = { title: "Projects" };

export default async function ProjectsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; denied?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/projects");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  const projects = portfolio.projects.slice().sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="Your work"
        description="Curate what appears publicly. Projects can be featured, hidden, excluded from GitHub syncs or deleted entirely."
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/github" className={buttonClasses("secondary", "sm")}>
              <Github className="size-3.5" aria-hidden />
              Sync GitHub
            </Link>
            <Link href="/dashboard/projects/new" className={buttonClasses("primary", "sm")}>
              <Plus className="size-3.5" aria-hidden />
              Add project
            </Link>
          </div>
        }
      />

      <Flash message={params.saved ? "Project saved and published." : undefined} />
      {params.denied && <Flash tone="error" message="That project belongs to another portfolio." />}

      {projects.length === 0 ? (
        <EmptyState
          icon={<SquareStack className="size-4" aria-hidden />}
          title="No projects yet"
          description="Import public repositories from GitHub, or add a project manually with your own description and screenshots."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/dashboard/github" className={buttonClasses("secondary", "sm")}>
                <Github className="size-3.5" aria-hidden />
                Import from GitHub
              </Link>
              <Link href="/dashboard/projects/new" className={buttonClasses("primary", "sm")}>
                <Plus className="size-3.5" aria-hidden />
                Add manually
              </Link>
            </div>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="hidden grid-cols-[1fr_120px_110px_1fr_90px] gap-3 border-b border-line bg-white/[0.02] px-4 py-2.5 font-mono text-[8.5px] tracking-[0.1em] text-muted uppercase lg:grid">
            <span>Project</span>
            <span>Category</span>
            <span>Status</span>
            <span>Visibility</span>
            <span className="text-right">Actions</span>
          </div>

          {projects.map((project) => (
            <div
              key={project.id}
              className={`grid gap-3 border-b border-line px-4 py-3.5 last:border-0 transition-colors hover:bg-white/[0.02] lg:grid-cols-[1fr_120px_110px_1fr_90px] lg:items-center ${
                project.excluded ? "opacity-60" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line">
                  {project.imageUrl ? (
                    <Image src={project.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[11px] font-medium text-white/80" style={{ background: monogramGradient(project.name) }}>
                      {initials(project.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[12.5px] font-medium text-text">{project.name}</p>
                    {project.featured && <Star className="size-3 shrink-0 fill-sand text-sand" aria-label="Featured" />}
                  </div>
                  <p className="truncate text-[10.5px] text-muted">{project.tagline || "No description yet"}</p>
                  <p className="mt-0.5 font-mono text-[8.5px] text-muted/70 uppercase">
                    {project.source === "github" ? "GitHub" : "Manual"}
                    {project.lastPushedAt ? ` · ${relativeTime(project.lastPushedAt)}` : ""}
                  </p>
                </div>
              </div>

              <span className="font-mono text-[9.5px] tracking-[0.06em] text-muted uppercase">{categoryLabel(project.category)}</span>
              <StatusBadge status={project.status} size="sm" />

              <div className="flex flex-wrap items-center gap-1">
                <form action={toggleProjectFlagAction}>
                  <input type="hidden" name="portfolioId" value={portfolio.id} />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="field" value="featured" />
                  <input type="hidden" name="redirectTo" value="/dashboard/projects" />
                  <SubmitButton variant="ghost" size="sm" pendingLabel="">
                    <Star className={`size-3.5 ${project.featured ? "fill-sand text-sand" : ""}`} aria-hidden />
                    <span className="sr-only">{project.featured ? "Unfeature" : "Feature"}</span>
                  </SubmitButton>
                </form>
                <form action={toggleProjectFlagAction}>
                  <input type="hidden" name="portfolioId" value={portfolio.id} />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="field" value="published" />
                  <input type="hidden" name="redirectTo" value="/dashboard/projects" />
                  <SubmitButton variant="ghost" size="sm" pendingLabel="">
                    {project.published ? <Eye className="size-3.5 text-mint" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    <span className="sr-only">{project.published ? "Hide from public page" : "Show on public page"}</span>
                  </SubmitButton>
                </form>
                <form action={toggleProjectFlagAction}>
                  <input type="hidden" name="portfolioId" value={portfolio.id} />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="field" value="excluded" />
                  <input type="hidden" name="redirectTo" value="/dashboard/projects" />
                  <SubmitButton variant="ghost" size="sm" pendingLabel="">
                    <Ban className={`size-3.5 ${project.excluded ? "text-danger" : ""}`} aria-hidden />
                    <span className="sr-only">{project.excluded ? "Include again" : "Exclude from sync and public page"}</span>
                  </SubmitButton>
                </form>
                <span className="font-mono text-[9px] text-muted">
                  {project.published ? "public" : "hidden"}{project.excluded ? " · excluded" : ""}
                </span>
              </div>

              <div className="flex items-center justify-end gap-1">
                <Link href={`/dashboard/projects/${project.id}`} className={buttonClasses("ghost", "sm")} aria-label={`Edit ${project.name}`}>
                  <Pencil className="size-3.5" aria-hidden />
                </Link>
                {project.published && portfolio.published && (
                  <Link
                    href={`/projects/${project.slug}`}
                    className={buttonClasses("ghost", "sm")}
                    aria-label={`View ${project.name} in the personal portfolio`}
                  >
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                )}
                <ConfirmForm
                  action={deleteProjectAction}
                  title={`Delete ${project.name}`}
                  description="This removes the project permanently."
                  triggerLabel="Delete"
                  confirmLabel="Delete"
                >
                  <input type="hidden" name="portfolioId" value={portfolio.id} />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="redirectTo" value="/dashboard/projects" />
                </ConfirmForm>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-muted">
        The <span className="text-text-2">star</span> controls the featured flag, the <span className="text-text-2">eye</span> hides a
        project from your public page, and the <span className="text-text-2">ban</span> excludes it from future GitHub syncs.
      </p>
    </div>
  );
}
