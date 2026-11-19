import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectForm } from "@/components/dashboard/project-form";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/projects");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  return (
    <div>
      <Link href="/dashboard/projects" className="mb-5 inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-text">
        <ArrowLeft className="size-3.5" aria-hidden />
        Projects
      </Link>
      <PageHeader
        eyebrow="New project"
        title="Add a project"
        description="Write only what is true and verifiable. Status and progress are shown to visitors exactly as you set them."
      />
      <div className="max-w-3xl">
        <ProjectForm portfolioId={portfolio.id} />
      </div>
    </div>
  );
}
