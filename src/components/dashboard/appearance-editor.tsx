"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { FieldShell } from "@/components/ui/field";
import { updateAppearanceAction } from "@/app/actions/portfolio";
import { ACCENT_SWATCHES, TEMPLATES } from "@/lib/templates";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import { TemplateFrame } from "@/components/portfolio/template-frame";
import type { PortfolioView } from "@/lib/portfolio-view";
import type { ActionResult } from "@/lib/action-result";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function AppearanceEditor({
  portfolio,
  view,
}: {
  portfolio: { id: string; slug: string; template: string; accent: string; fontStyle: string; appearance: string };
  view: PortfolioView;
}) {
  const [template, setTemplate] = useState(portfolio.template);
  const [accent, setAccent] = useState(portfolio.accent);
  const [fontStyle, setFontStyle] = useState(portfolio.fontStyle);
  const [appearance, setAppearance] = useState(portfolio.appearance);

  const preview: PortfolioView = {
    ...view,
    template,
    accent,
    fontStyle,
    appearance,
    published: true,
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="rounded-xl border border-line bg-white/[0.015] p-5">
        <ActionForm action={updateAppearanceAction as Action} noValidate>
          <input type="hidden" name="portfolioId" value={portfolio.id} />
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="accent" value={accent} />
          <input type="hidden" name="fontStyle" value={fontStyle} />
          <input type="hidden" name="appearance" value={appearance} />

          <FieldShell label="Template" htmlFor="template-picker" hint="Layout structure, not just colour. Preview updates as you choose.">
            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
              {TEMPLATES.map((item) => {
                const selected = template === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTemplate(item.id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selected ? "border-mint/45 bg-mint/[0.05]" : "border-line bg-ink hover:border-line-strong"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-text">{item.name}</span>
                      {selected ? (
                        <Check className="size-3.5 text-mint" aria-hidden />
                      ) : (
                        <span className="size-2 rounded-full" style={{ background: item.defaultAccent }} aria-hidden />
                      )}
                    </span>
                    <span className="mt-1 block font-mono text-[8.5px] tracking-[0.06em] text-muted uppercase">{item.layout}</span>
                  </button>
                );
              })}
            </div>
          </FieldShell>

          <FieldShell label="Accent colour" htmlFor="accent-picker" hint="Used for links, markers and emphasis only — never for large fills.">
            <div id="accent-picker" className="mt-1.5 flex flex-wrap items-center gap-2">
              {ACCENT_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Accent ${color}`}
                  aria-pressed={accent === color}
                  onClick={() => setAccent(color)}
                  className={`flex size-8 items-center justify-center rounded-full ring-1 ring-white/15 transition-all ${
                    accent === color ? "ring-2 ring-mint ring-offset-2 ring-offset-surface" : "hover:ring-white/30"
                  }`}
                  style={{ background: color }}
                >
                  {accent === color && <Check className="size-3.5 text-ink" aria-hidden />}
                </button>
              ))}
              <label className="ml-1 flex items-center gap-2 text-[10.5px] text-muted">
                Custom
                <input
                  type="color"
                  value={accent}
                  onChange={(event) => setAccent(event.target.value)}
                  className="h-7 w-9 cursor-pointer rounded border border-line bg-transparent"
                  aria-label="Custom accent colour"
                />
              </label>
            </div>
          </FieldShell>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Typeface" htmlFor="font-picker">
              <select
                id="font-picker"
                value={fontStyle}
                onChange={(event) => setFontStyle(event.target.value)}
                className="field mt-1.5"
              >
                <option value="sans">Geist Sans — neutral, modern</option>
                <option value="serif">Geist Serif — editorial</option>
                <option value="mono">Geist Mono — technical</option>
              </select>
            </FieldShell>

            <FieldShell label="Appearance" htmlFor="appearance-picker">
              <select
                id="appearance-picker"
                value={appearance}
                onChange={(event) => setAppearance(event.target.value)}
                className="field mt-1.5"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </FieldShell>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <p className="font-mono text-[9.5px] tracking-[0.06em] text-muted uppercase">
              Changes apply to the whole public page
            </p>
            <SubmitButton pendingLabel="Saving…">Save design</SubmitButton>
          </div>
        </ActionForm>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Live preview</p>
          <p className="font-mono text-[9px] text-muted">{template} · {appearance}</p>
        </div>
        <TemplateFrame height="520px" scale="0.315" label="Live design preview">
          <PortfolioRenderer view={preview} />
        </TemplateFrame>
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
          Rendered with your real content at desktop width, clipped to fit. Open the full preview to check mobile.
        </p>
      </div>
    </div>
  );
}
