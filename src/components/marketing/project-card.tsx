import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/domain";
import { monogramGradient } from "@/lib/templates";
import type { ProjectView } from "@/lib/portfolio-view";
import { cn, initials } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectView;
  featured?: boolean;
  className?: string;
}

/**
 * Premium project card. Real screenshots are used when a project has them;
 * otherwise a deterministic monogram plate is drawn — never a stock image
 * pretending to be the product.
 */
export function ProjectCard({ project, featured, className }: ProjectCardProps) {
  return (
    <article
      className={cn(
        "panel panel-hover group relative overflow-hidden",
        featured && "md:col-span-2",
        className,
      )}
    >
      <Link href={`/projects/${project.slug}`} className="block focus-visible:outline-none">
        <div className={cn("relative overflow-hidden border-b border-line", featured ? "aspect-[16/8]" : "aspect-[16/10]")}>
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={`${project.name} interface`}
              fill
              sizes={featured ? "(max-width: 768px) 100vw, 1100px" : "(max-width: 768px) 100vw, 550px"}
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ background: monogramGradient(project.name) }}
              aria-hidden
            >
              <div className="relative flex flex-col items-center">
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                  {project.language ?? "Project"}
                </span>
                <span className="mt-1 text-[46px] leading-none font-medium tracking-[-0.04em] text-white/85">
                  {initials(project.name)}
                </span>
                <span className="mt-3 h-px w-10 bg-white/25" />
                <span className="mt-2 font-mono text-[9px] tracking-[0.16em] text-white/30 uppercase">No screenshot yet</span>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
            <StatusBadge status={project.status} />
            {project.progress !== null && (
              <span className="rounded-full border border-white/15 bg-ink/70 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur">
                {project.progress}%
              </span>
            )}
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h3 className="truncate text-[17px] font-medium tracking-[-0.01em] text-text md:text-[19px]">{project.name}</h3>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-mint"
                  aria-hidden
                />
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{project.tagline}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{categoryLabel(project.category)}</Badge>
            {project.stack.slice(0, featured ? 5 : 3).map((tech) => (
              <span key={tech} className="font-mono text-[10.5px] text-muted">
                {tech}
              </span>
            ))}
            {project.stack.length > (featured ? 5 : 3) && (
              <span className="font-mono text-[10.5px] text-muted/70">
                +{project.stack.length - (featured ? 5 : 3)}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.06em] text-muted uppercase">
              Case study
            </span>
            <div className="flex items-center gap-3">
              {project.demoUrl && (
                <span className="rounded-full border border-mint/25 bg-mint/[0.08] px-2 py-0.5 font-mono text-[9.5px] tracking-[0.06em] text-mint uppercase">
                  Live demo
                </span>
              )}
              {project.repoUrl && (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
                  <Github className="size-3" aria-hidden />
                  Repo
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
