import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { toPortfolioView } from "@/lib/portfolio-view";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function PreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/preview");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  const view = toPortfolioView(portfolio);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-text">
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to dashboard
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-medium tracking-[-0.02em]">Draft preview</h1>
            <StatusBadge status={portfolio.published ? "live" : "planned"} />
            <span className="text-[11px] text-muted">
              {portfolio.published ? "This is exactly what visitors see." : "Only you can see this until you publish."}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/appearance" className={buttonClasses("secondary", "sm")}>Edit design</Link>
          {portfolio.published && (
            <Link href={`/u/${portfolio.slug}`} className={buttonClasses("primary", "sm")}>
              Open public page
              <ExternalLink className="size-3" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        <div className="border-b border-line bg-ink-2 px-4 py-2 font-mono text-[9.5px] tracking-[0.08em] text-muted uppercase">
          Preview · {view.template} template · {view.sections.filter((section) => section.visible).length} sections visible
        </div>
        <PortfolioRenderer view={view} />
      </div>
    </div>
  );
}
