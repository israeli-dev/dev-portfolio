import Link from "next/link";
import { ArrowUpRight, Hammer } from "lucide-react";
import { Section } from "@/components/ui/section";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { categoryLabel } from "@/lib/domain";
import type { ProjectView } from "@/lib/portfolio-view";

export function BuildingSection({ projects }: { projects: ProjectView[] }) {
  const active = projects.filter((project) =>
    ["in-development", "experimental", "planned"].includes(project.status),
  );
  if (!active.length) return null;

  return (
    <Section
      id="building"
      eyebrow="04 — In public"
      title="Currently building."
      description="Work in progress, shown as work in progress. Progress figures are the owner's own estimate and appear only where a roadmap exists."
      bordered
    >
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {active.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="group grid gap-4 bg-ink p-5 transition-colors hover:bg-surface md:grid-cols-[1.1fr_1.4fr_auto] md:items-center md:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-sand">
                <Hammer className="size-4" aria-hidden />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14.5px] font-medium text-text">{project.name}</span>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <p className="mt-1 font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                  {categoryLabel(project.category)}
                  {project.progress !== null && ` · ~${project.progress}% of documented scope`}
                </p>
              </div>
            </div>

            <div>
              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted">{project.tagline}</p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sand/70 to-mint/80"
                  style={{ width: `${project.progress ?? 35}%` }}
                  role="progressbar"
                  aria-valuenow={project.progress ?? undefined}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${project.name} progress`}
                />
              </div>
              {project.progress === null && (
                <p className="mt-2 font-mono text-[9px] tracking-[0.08em] text-muted/70 uppercase">
                  Progress not quantified by the owner
                </p>
              )}
            </div>

            <span className="hidden items-center gap-1.5 text-[11.5px] text-muted transition-colors group-hover:text-mint md:flex">
              Details
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-[12px] leading-relaxed text-muted">
          Roadmaps, limitations and what remains unbuilt are documented inside each case study.
        </p>
        <Link href="/projects" className={buttonClasses("secondary", "sm")}>
          All projects
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}
