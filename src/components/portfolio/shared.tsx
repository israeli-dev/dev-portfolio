import type { PortfolioView } from "@/lib/portfolio-view";
import { initials } from "@/lib/utils";

export type SectionId = "about" | "projects" | "skills" | "experience" | "education" | "achievements" | "contact";

export function isVisible(view: PortfolioView, id: SectionId): boolean {
  const section = view.sections.find((item) => item.id === id);
  return section ? section.visible : true;
}

export function orderedSections(view: PortfolioView): string[] {
  return view.sections.slice().sort((a, b) => a.order - b.order).map((section) => section.id);
}

export function Monogram({ name, className = "", style }: { name: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border ${className}`}
      style={style}
      aria-hidden
    >
      <span className="font-medium tracking-[-0.03em]">{initials(name)}</span>
    </div>
  );
}

/** Contact list used by templates; mailto links are validated by the formatter. */
export function contactItems(view: PortfolioView): { label: string; value: string; href: string }[] {
  const items: { label: string; value: string; href: string }[] = [];
  if (view.email) items.push({ label: "Email", value: view.email, href: `mailto:${view.email}` });
  for (const link of view.socialLinks) {
    items.push({ label: link.label, value: link.url.replace(/^https?:\/\//, "").replace(/\/$/, ""), href: link.url });
  }
  return items;
}

export function FolioCredit({ light = false }: { light?: boolean }) {
  return (
    <p className={`text-[10px] tracking-[0.12em] uppercase ${light ? "text-[#8b8378]" : "opacity-45"}`}>
      Published with Folio
    </p>
  );
}

/** Root classes for a published portfolio, including appearance + font pairing. */
export function pfRootClass(view: PortfolioView): string {
  const appearance = view.appearance === "light" ? "pf-light" : "";
  const font = view.fontStyle === "serif" ? "pf-serif" : view.fontStyle === "mono" ? "pf-mono" : "";
  return `pf min-h-dvh ${appearance} ${font}`.trim();
}
