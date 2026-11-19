import type { PortfolioView } from "@/lib/portfolio-view";
import { TemplateSignal } from "@/components/portfolio/template-signal";
import { TemplateMonograph } from "@/components/portfolio/template-monograph";
import { TemplateAtlas } from "@/components/portfolio/template-atlas";
import { TemplateTerminal } from "@/components/portfolio/template-terminal";

const RENDERERS = {
  signal: TemplateSignal,
  monograph: TemplateMonograph,
  atlas: TemplateAtlas,
  terminal: TemplateTerminal,
} as const;

/**
 * Server-side template switch. The template id comes from the database, so we
 * whitelist it here rather than resolve arbitrary components.
 */
export function PortfolioRenderer({ view }: { view: PortfolioView }) {
  const Template = RENDERERS[(view.template as keyof typeof RENDERERS)] ?? TemplateSignal;
  return <Template view={view} />;
}
