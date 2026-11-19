import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/components/dashboard/project-form";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/projects");

  const portfolio = await db.portfolio.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  if (!portfolio) redirect("/dashboard");

  const project = await db.project.findFirst({ where: { id, portfolioId: portfolio.id } });
  if (!project) notFound();

  return (
    <div>
      <Link href="/dashboard/projects" className="mb-5 inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-text">
        <ArrowLeft className="size-3.5" aria-hidden />
        Projects
      </Link>
      <PageHeader
        eyebrow="Edit project"
        title={project.name}
        description="Changes publish immediately if the portfolio and project are both public."
        action={<StatusBadge status={project.status} />}
      />

      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-5 inline-flex items-center gap-1.5 text-[11.5px] text-mint hover:text-[#a3e6d8]"
        >
          View repository
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}

      <div className="max-w-3xl">
        <ProjectForm project={project} portfolioId={portfolio.id} />
      </div>
    </div>
  );
}
