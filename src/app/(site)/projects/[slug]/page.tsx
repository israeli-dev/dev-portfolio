import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleAlert,
  Github,
  GitFork,
  Star,
  Terminal,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/marketing/project-card";
import { buttonClasses } from "@/components/ui/button";
import { getOwnerPortfolio } from "@/lib/queries";
import { categoryLabel, isWorkInProgress, statusMeta } from "@/lib/domain";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOwnerPortfolio();
  const project = data?.view.projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.name,
    description: project.tagline || project.description.slice(0, 160),
    openGraph: {
      title: `${project.name} · Israel Kolawole`,
      description: project.tagline,
      url: `/projects/${project.slug}`,
      images: project.imageUrl ? [{ url: project.imageUrl }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const data = await getOwnerPortfolio();
  const project = data?.view.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const related = data!.view.projects.filter((item) => item.slug !== project.slug).slice(0, 2);
  const status = statusMeta(project.status);
  const gallery = project.images.filter((image) => image.url !== project.imageUrl);

  return (
    <article>
      <div className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgba(224,164,88,0.09),transparent_55%)]">
        <div className="shell py-10 md:py-14">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-text">
            <ArrowLeft className="size-3.5" aria-hidden />
            All projects
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={project.status} />
                <Badge tone="neutral">{categoryLabel(project.category)}</Badge>
                {project.language && <Badge tone="neutral">{project.language}</Badge>}
              </div>

              <h1 className="mt-5 text-[38px] leading-[1.02] font-medium tracking-[-0.04em] md:text-[52px]">
                {project.name}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-2 md:text-[16.5px]">{project.tagline}</p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "md")}>
                    Visit live app
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md")}>
                    <Github className="size-4" aria-hidden />
                    Repository
                  </a>
                )}
              </div>
            </div>

            <aside className="panel p-5">
              <p className="eyebrow mb-4">Project record</p>
              <dl className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Status</dt>
                  <dd className="text-right text-text-2">{status.label}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Category</dt>
                  <dd className="text-right text-text-2">{categoryLabel(project.category)}</dd>
                </div>
                {project.repoName && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">Repository</dt>
                    <dd className="font-mono text-[11px] text-text-2">{project.repoName}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Last activity</dt>
                  <dd className="text-right text-text-2">{formatDate(project.lastPushedAt, { day: "numeric", month: "short", year: "numeric" }) || "—"}</dd>
                </div>
                {project.progress !== null && (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted">Owner-estimated progress</dt>
                      <dd className="font-mono text-text-2">{project.progress}%</dd>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="h-full rounded-full bg-mint/70" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <Star className="size-3" aria-hidden /> Stars
                  </dt>
                  <dd className="text-text-2">{project.stars}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="inline-flex items-center gap-1.5 text-muted">
                    <GitFork className="size-3" aria-hidden /> Forks
                  </dt>
                  <dd className="text-text-2">{project.forks}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </div>

      {isWorkInProgress(project.status) && (
        <div className="border-b border-sand/20 bg-sand/[0.06]">
          <div className="shell flex items-start gap-3 py-3.5">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden />
            <p className="text-[12px] leading-relaxed text-sand/90">
              <span className="font-medium">Work in progress.</span> {status.description} Features described below may be
              partial or planned — check the repository for the current state.
            </p>
          </div>
        </div>
      )}

      {project.imageUrl && (
        <div className="shell py-10 md:py-14">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Image
              src={project.imageUrl}
              alt={`${project.name} interface`}
              width={1920}
              height={1080}
              className="h-auto w-full"
              priority
            />
          </div>
          <p className="mt-2.5 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
            Actual application screenshot · from the project repository
          </p>
        </div>
      )}

      <div className="shell grid gap-12 py-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16 md:py-16">
        <div className="space-y-10">
          {project.description && (
            <section>
              <h2 className="text-[18px] font-medium tracking-[-0.01em] text-text">Overview</h2>
              <p className="prose-folio mt-3">{project.description}</p>
            </section>
          )}

          {project.problem && (
            <section>
              <h2 className="text-[18px] font-medium tracking-[-0.01em] text-text">The problem</h2>
              <p className="prose-folio mt-3">{project.problem}</p>
            </section>
          )}

          {project.features.length > 0 && (
            <section>
              <h2 className="text-[18px] font-medium tracking-[-0.01em] text-text">What it does</h2>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 rounded-lg border border-line bg-white/[0.02] p-3 text-[12.5px] leading-relaxed text-text-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-mint" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.contribution && (
            <section>
              <h2 className="text-[18px] font-medium tracking-[-0.01em] text-text">My contribution</h2>
              <p className="prose-folio mt-3">{project.contribution}</p>
            </section>
          )}

          {project.architecture && (
            <section>
              <h2 className="text-[18px] font-medium tracking-[-0.01em] text-text">Architecture</h2>
              <div className="mt-3 rounded-xl border border-line bg-ink-2 p-4">
                <div className="mb-3 flex items-center gap-2 font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">
                  <Terminal className="size-3" aria-hidden />
                  How it fits together
                </div>
                <p className="text-[13px] leading-relaxed text-text-2">{project.architecture}</p>
              </div>
            </section>
          )}

          {gallery.length > 0 && (
            <section>
              <h2 className="text-[18px] font-medium tracking-[-0.01em] text-text">Screens</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {gallery.map((image) => (
                  <figure key={image.url} className="overflow-hidden rounded-xl border border-line">
                    <Image src={image.url} alt={image.alt} width={1920} height={1080} className="h-auto w-full" />
                    <figcaption className="border-t border-line px-3 py-2 font-mono text-[9.5px] tracking-[0.06em] text-muted uppercase">
                      {image.alt}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {project.stack.length > 0 && (
            <div className="panel p-5">
              <h2 className="eyebrow mb-3">Technology</h2>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span key={tech} className="rounded-md border border-line bg-white/[0.03] px-2 py-1 font-mono text-[10.5px] text-text-2">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-line bg-white/[0.02] p-5">
            <h2 className="eyebrow mb-3">Status meaning</h2>
            <p className="text-[11.5px] leading-relaxed text-muted">
              <span className="text-text-2">{status.label}</span> — {status.description}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-line p-5">
            <h2 className="eyebrow mb-2">Accuracy</h2>
            <p className="text-[11.5px] leading-relaxed text-muted">
              This page is generated from the owner&apos;s curated record, seeded from the public repository. Where
              information was unavailable, it is omitted rather than guessed.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="border-t border-line">
          <div className="shell py-14">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-[20px] font-medium tracking-[-0.02em]">More work</h2>
              <Link href="/projects" className={buttonClasses("ghost", "sm")}>
                All projects <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
