import { Compass, FlaskConical, Layers, MapPin } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { OWNER } from "@/content/personal";
import type { PortfolioView } from "@/lib/portfolio-view";

export function AboutSection({ view }: { view: PortfolioView }) {
  return (
    <Section
      id="about"
      eyebrow="01 — About"
      title={<>Geology taught the questions. <span className="text-muted">Engineering builds the answers.</span></>}
      description="A short, honest account of where I started and what I am building now."
      bordered
    >
      <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
        <div>
          <div className="prose-folio max-w-2xl space-y-5">
            {OWNER.story.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-2">
            {["Groundwater exploration", "Geophysical interpretation", "Applied LLMs", "Python & TypeScript", "Scientific software"].map(
              (item) => (
                <Badge key={item} tone="neutral" className="normal-case tracking-normal">
                  {item}
                </Badge>
              ),
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="panel p-5">
            <p className="eyebrow mb-4">Field notes</p>
            <dl className="space-y-4 text-[12.5px]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden />
                <div>
                  <dt className="text-muted">Based in</dt>
                  <dd className="mt-0.5 text-text-2">{OWNER.location}, working globally</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden />
                <div>
                  <dt className="text-muted">Focus</dt>
                  <dd className="mt-0.5 text-text-2">LLM applications, scientific data, geoscience software</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FlaskConical className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden />
                <div>
                  <dt className="text-muted">Currently learning</dt>
                  <dd className="mt-0.5 text-text-2">Retrieval-augmented generation, LLM evaluation, agentic workflows</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Compass className="mt-0.5 size-4 shrink-0 text-sand" aria-hidden />
                <div>
                  <dt className="text-muted">Open to</dt>
                  <dd className="mt-0.5 text-text-2">{view.availability || OWNER.availability}</dd>
                </div>
              </div>
            </dl>
          </div>

          <blockquote className="rounded-xl border border-line bg-white/[0.02] p-5">
            <p className="text-[13px] leading-relaxed text-text-2">
              “The data is incomplete, the conditions are not ideal, and the answer still has to be defensible.”
            </p>
            <footer className="mt-3 font-mono text-[9.5px] tracking-[0.1em] text-muted uppercase">
              Working principle
            </footer>
          </blockquote>
        </aside>
      </div>
    </Section>
  );
}
