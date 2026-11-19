"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/marketing/project-card";
import { StatusLegend } from "@/components/ui/status-badge";
import { PROJECT_CATEGORIES } from "@/lib/domain";
import type { ProjectView } from "@/lib/portfolio-view";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";

export function ProjectFilters({ projects }: { projects: ProjectView[] }) {
  const [category, setCategory] = useState<string>("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) map.set(project.category, (map.get(project.category) ?? 0) + 1);
    return map;
  }, [projects]);

  const filtered = category === "all" ? projects : projects.filter((project) => project.category === category);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter projects by category">
          <button
            type="button"
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
              category === "all"
                ? "border-mint/30 bg-mint/10 text-mint"
                : "border-line text-muted hover:border-line-strong hover:text-text-2",
            )}
          >
            All <span className="ml-1 font-mono text-[10px] opacity-60">{projects.length}</span>
          </button>
          {PROJECT_CATEGORIES.filter((item) => counts.get(item.id)).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
                category === item.id
                  ? "border-mint/30 bg-mint/10 text-mint"
                  : "border-line text-muted hover:border-line-strong hover:text-text-2",
              )}
            >
              {item.label}
              <span className="ml-1 font-mono text-[10px] opacity-60">{counts.get(item.id)}</span>
            </button>
          ))}
        </div>
        <StatusLegend className="md:justify-end" />
      </div>

      <div className="mt-8">
        {filtered.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<SearchX className="size-4" aria-hidden />}
            title="Nothing in this category yet"
            description="Projects are assigned a category by their owner. Try another filter."
          />
        )}
      </div>

      <p className="mt-8 font-mono text-[10px] tracking-[0.08em] text-muted/80 uppercase">
        Showing {filtered.length} of {projects.length} published projects
      </p>
    </div>
  );
}
