import Link from "next/link";
import { ArrowRight, Github, LayoutTemplate, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/templates";

export function PlatformCta() {
  return (
    <section className="border-t border-line">
      <div className="shell py-16 md:py-24">
        <div className="relative overflow-hidden rounded-[24px] border border-line-strong bg-[radial-gradient(ellipse_at_top_left,rgba(125,211,192,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(224,164,88,0.12),transparent_50%)] p-7 md:p-12">
          <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink/60 px-3 py-1 font-mono text-[9.5px] tracking-[0.12em] text-text-2 uppercase">
                <Sparkles className="size-3 text-mint" aria-hidden />
                This site is also the product
              </span>
              <h2 className="mt-5 max-w-xl text-[28px] leading-[1.1] font-medium tracking-[-0.03em] md:text-[40px]">
                Your work deserves better than a template that looks like everyone else&apos;s.
              </h2>
              <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-muted">
                Folio is the multi-tenant platform underneath this portfolio. Create an account, import public GitHub
                repositories, choose a layout built for your discipline and publish to a URL you own.
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link href="/signup" className={buttonClasses("primary", "lg")}>
                  Build your portfolio
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/templates" className={buttonClasses("secondary", "lg")}>
                  <LayoutTemplate className="size-4" aria-hidden />
                  Browse templates
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                <span className="inline-flex items-center gap-1.5"><Github className="size-3" aria-hidden /> GitHub sync</span>
                <span>·</span>
                <span>{TEMPLATES.length} layout engines</span>
                <span>·</span>
                <span>25 profession presets</span>
                <span>·</span>
                <span>Real public URLs</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((template, index) => (
                <div
                  key={template.id}
                  className="group relative overflow-hidden rounded-xl border border-line-strong bg-ink/70 p-4 transition-colors hover:border-mint/35"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
                      0{index + 1}
                    </span>
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: template.defaultAccent }}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-6 text-[14px] font-medium text-text">{template.name}</p>
                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-muted">{template.layout}</p>
                  <div className="mt-4 space-y-1.5" aria-hidden>
                    <div className="h-1 w-3/4 rounded-full bg-white/10" />
                    <div className="h-1 w-1/2 rounded-full bg-white/[0.07]" />
                    <div className="h-1 w-2/3 rounded-full bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
