import type { Metadata } from "next";
import { ProjectFilters } from "@/components/marketing/project-filters";
import { getOwnerPortfolio } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Deployed applications, completed work and active experiments by Israel Kolawole — each with repository links, architecture notes and honest project status.",
  openGraph: {
    title: "Projects · Israel Kolawole",
    description: "AI, geoscience and web applications — with statuses and repositories attached.",
    url: "/projects",
  },
};

export default async function ProjectsPage() {
  const data = await getOwnerPortfolio();

  if (!data) {
    return (
      <div className="shell py-28 text-center">
        <h1 className="text-[28px] font-medium">No portfolio data yet</h1>
        <p className="mt-2 text-sm text-muted">Run <code className="font-mono text-mint">npm run setup</code> to seed the database.</p>
      </div>
    );
  }

  const projects = data.view.projects;

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[340px] border-b border-line bg-[radial-gradient(ellipse_at_top,rgba(125,211,192,0.08),transparent_65%)]" aria-hidden />
      <div className="shell relative pt-16 pb-20 md:pt-24">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Index of work</p>
          <h1 className="text-[38px] leading-[1.02] font-medium tracking-[-0.04em] md:text-[56px]">
            Projects, with the receipts.
          </h1>
          <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-muted">
            {projects.length} published projects drawn from public repositories, then curated by hand. Status is stated
            plainly: deployed work is marked live, incomplete work is marked as in development.
          </p>
        </div>

        <div className="mt-12">
          <ProjectFilters projects={projects} />
        </div>
      </div>
    </div>
  );
}
