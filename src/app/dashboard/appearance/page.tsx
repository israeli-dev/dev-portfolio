import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { toPortfolioView } from "@/lib/portfolio-view";
import { PageHeader } from "@/components/dashboard/page-header";
import { AppearanceEditor } from "@/components/dashboard/appearance-editor";
import { Flash } from "@/components/dashboard/flash";
import { SubmitButton } from "@/components/ui/submit-button";
import { Save } from "lucide-react";
import { saveSectionsAction } from "@/app/actions/portfolio";
import { sectionsOrDefault } from "@/lib/domain";

export const metadata = { title: "Appearance" };

export default async function AppearancePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/appearance");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  const view = toPortfolioView(portfolio);
  const sections = sectionsOrDefault(portfolio.sections);

  return (
    <div>
      <PageHeader
        eyebrow="Appearance"
        title="Design and visibility"
        description="One template, one accent, one typeface. Change the structure without touching code."
        action={
          <Link href="/dashboard/preview" className="inline-flex items-center gap-1.5 text-[11.5px] text-mint hover:text-[#a3e6d8]">
            Full preview
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        }
      />

      <Flash message={params.saved} />

      <AppearanceEditor
        portfolio={{
          id: portfolio.id,
          slug: portfolio.slug,
          template: portfolio.template,
          accent: portfolio.accent,
          fontStyle: portfolio.fontStyle,
          appearance: portfolio.appearance,
        }}
        view={view}
      />

      <div className="mt-8 max-w-2xl rounded-xl border border-line bg-white/[0.015] p-5">
        <h2 className="text-[14px] font-medium">Public sections</h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          Unchecked sections are removed from the public page entirely — not merely hidden with CSS. Empty sections are
          skipped automatically.
        </p>
        <form action={saveSectionsAction} className="mt-4 space-y-2">
          <input type="hidden" name="portfolioId" value={portfolio.id} />
          <input type="hidden" name="redirectTo" value="/dashboard/appearance" />
          {sections.map((section) => (
            <label key={section.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-ink px-3 py-2">
              <span className="text-[12px] text-text-2">{section.label}</span>
              <input
                type="checkbox"
                name={`visible_${section.id}`}
                defaultChecked={section.visible}
                className="size-4 accent-[#7DD3C0]"
              />
            </label>
          ))}
          <div className="flex justify-end pt-2">
            <SubmitButton size="sm" variant="secondary" pendingLabel="Saving…">
              <Save className="size-3.5" aria-hidden />
              Save visibility
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
