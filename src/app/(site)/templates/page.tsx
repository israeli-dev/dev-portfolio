import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Palette, Type } from "lucide-react";
import { TEMPLATES, PROFESSION_PRESETS, presetByProfession } from "@/lib/templates";
import { buildPreviewView } from "@/content/preview";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import { TemplateFrame } from "@/components/portfolio/template-frame";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Four structurally different portfolio templates — Signal, Monograph, Atlas and Terminal — with presets for 25 professions across technology, business, research, creative and industry.",
  openGraph: { title: "Templates · Folio", description: "Four layout engines, twenty-five profession presets.", url: "/templates" },
};

const FEATURED_PRESET: Record<string, string> = {
  signal: "ai-engineer",
  monograph: "researcher",
  atlas: "geologist",
  terminal: "devops",
};

const GROUPS = ["Technology", "Business", "Academic & Research", "Creative", "Engineering & Industry"] as const;

export default function TemplatesPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 grid-lines opacity-80" aria-hidden />
        <div className="shell relative py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Templates</p>
            <h1 className="mt-4 text-[38px] leading-[1.02] font-medium tracking-[-0.04em] md:text-[56px]">
              Four layouts. Not four colour schemes.
            </h1>
            <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-muted">
              Each template is a separate layout engine with its own typography, hierarchy and section structure. Pick a
              profession preset to see it populated with sample content, then replace that content with your own.
            </p>
            <div className="mt-7 flex flex-wrap gap-4 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
              <span className="inline-flex items-center gap-1.5"><Palette className="size-3" aria-hidden /> Accent + appearance control</span>
              <span className="inline-flex items-center gap-1.5"><Type className="size-3" aria-hidden /> Sans, serif or mono</span>
              <span className="inline-flex items-center gap-1.5"><Check className="size-3" aria-hidden /> Responsive + accessible</span>
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {TEMPLATES.map((template) => {
              const preset = presetByProfession(FEATURED_PRESET[template.id])!;
              const view = buildPreviewView({ template: template.id, preset });
              return (
                <article key={template.id} className="group">
                  <TemplateFrame
                    height="320px"
                    scale="0.34"
                    label={`${template.name} template preview with ${preset.label} sample content`}
                    className="transition-colors group-hover:border-line-strong"
                  >
                    <PortfolioRenderer view={view} />
                  </TemplateFrame>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-[17px] font-medium tracking-[-0.01em]">{template.name}</h2>
                        <span className="size-2 rounded-full" style={{ background: template.defaultAccent }} aria-hidden />
                      </div>
                      <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted">{template.description}</p>
                      <p className="mt-2 font-mono text-[9.5px] tracking-[0.08em] text-muted/80 uppercase">{template.layout}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {template.bestFor.slice(0, 3).map((item) => (
                        <Badge key={item} tone="neutral" className="normal-case tracking-normal">{item}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/templates/${template.id}`} className={buttonClasses("secondary", "sm")}>
                        Full preview
                        <ArrowUpRight className="size-3" aria-hidden />
                      </Link>
                      <Link href={`/signup?template=${template.id}`} className={buttonClasses("ghost", "sm")}>
                        Use template
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Profession presets</p>
          <h2 className="mt-3 text-[26px] font-medium tracking-[-0.03em] md:text-[34px]">
            25 starting points, across five industries.
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
            A preset pairs a layout, typography, palette and example copy for a discipline. You can change everything
            afterwards — including the template.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {GROUPS.map((group) => (
            <div key={group}>
              <div className="flex items-center gap-3">
                <h3 className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">{group}</h3>
                <span className="h-px flex-1 bg-line" aria-hidden />
                <span className="font-mono text-[10px] text-muted/70">
                  {PROFESSION_PRESETS.filter((preset) => preset.group === group).length}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {PROFESSION_PRESETS.filter((preset) => preset.group === group).map((preset) => (
                  <Link
                    key={preset.id}
                    href={`/templates/${preset.template}?profession=${preset.id}`}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.015] px-3 py-2.5 transition-colors hover:border-line-strong hover:bg-white/[0.035]"
                  >
                    <div>
                      <p className="text-[12px] text-text-2 transition-colors group-hover:text-text">{preset.label}</p>
                      <p className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-muted uppercase">{preset.template}</p>
                    </div>
                    <span className="size-1.5 rounded-full" style={{ background: preset.accent }} aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] px-5 py-4">
          <p className="text-[12.5px] text-muted">
            Preview pages are rendered with sample content and labelled as such. Your published portfolio uses only what
            you enter.
          </p>
          <Link href="/signup" className={buttonClasses("primary", "md")}>
            Start with a template
          </Link>
        </div>
      </section>
    </div>
  );
}
