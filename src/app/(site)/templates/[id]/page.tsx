import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TEMPLATES, PROFESSION_PRESETS, presetByProfession, templateById } from "@/lib/templates";
import { buildPreviewView } from "@/content/preview";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import { buttonClasses } from "@/components/ui/button";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ profession?: string }> };

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const { id } = await params;
  const { profession } = await searchParams;
  const template = TEMPLATES.find((item) => item.id === id);
  if (!template) return { title: "Template not found" };
  const preset = profession ? presetByProfession(profession) : undefined;
  return {
    title: `${template.name} template`,
    description: `${template.description} Preview with ${preset?.label ?? "sample"} content.`,
    robots: { index: true, follow: true },
  };
}

export default async function TemplatePreviewPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { profession } = await searchParams;
  const template = TEMPLATES.find((item) => item.id === id);
  if (!template) notFound();

  const preset = (profession && presetByProfession(profession)) || PROFESSION_PRESETS.find((item) => item.template === template.id) || PROFESSION_PRESETS[0];
  const view = buildPreviewView({ template: template.id, preset });
  const suggestions = PROFESSION_PRESETS.filter((item) => item.template === template.id).slice(0, 6);

  return (
    <div>
      <div className="sticky top-16 z-40 border-b border-line bg-ink/92 backdrop-blur-lg">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link href="/templates" className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-text">
              <ArrowLeft className="size-3.5" aria-hidden />
              Templates
            </Link>
            <span className="h-4 w-px bg-line-strong" aria-hidden />
            <p className="font-mono text-[10px] tracking-[0.08em] text-text-2 uppercase">
              {template.name} · {preset.label}
            </p>
            <span className="hidden rounded-full border border-sand/25 bg-sand/[0.08] px-2 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-sand uppercase sm:block">
              Sample content
            </span>
          </div>
          <Link href={`/signup?template=${template.id}`} className={buttonClasses("primary", "sm")}>
            Use this template
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {suggestions.length > 0 && (
          <div className="border-t border-line/60">
            <div className="shell scrollbar-none flex gap-1.5 overflow-x-auto py-2">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  href={`/templates/${template.id}?profession=${item.id}`}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] transition-colors ${
                    item.id === preset.id
                      ? "border-mint/30 bg-mint/10 text-mint"
                      : "border-line text-muted hover:border-line-strong hover:text-text-2"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-line bg-ink-2/60">
        <div className="shell flex flex-wrap items-center justify-between gap-2 py-2.5">
          <p className="text-[10.5px] text-muted">
            Live template preview. Content is a labelled sample persona — it is never published as anyone&apos;s portfolio.
          </p>
          <p className="font-mono text-[9px] tracking-[0.1em] text-muted/70 uppercase">{template.layout}</p>
        </div>
      </div>

      <PortfolioRenderer view={view} />

      <div className="border-t border-line bg-ink-2">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <p className="text-[13.5px] font-medium text-text">Like this structure?</p>
            <p className="mt-1 text-[12px] text-muted">Create an account and swap the sample content for your own.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/templates/${templateById(template.id === "signal" ? "monograph" : "signal").id}`} className={buttonClasses("secondary", "md")}>
              Browse other templates
            </Link>
            <Link href={`/signup?template=${template.id}`} className={buttonClasses("primary", "md")}>
              Start with {template.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
