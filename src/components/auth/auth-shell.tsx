import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  backHref = "/",
  backLabel = "Back to portfolio",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-ink-2 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 grid-lines opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 -left-24 size-[420px] rounded-full opacity-[0.14] blur-3xl"
          style={{ background: "radial-gradient(circle, #7DD3C0 0%, transparent 65%)" }}
          aria-hidden
        />
        <div className="relative">
          <Logo subtitle="portfolio platform" />
        </div>

        <div className="relative max-w-md">
          <p className="eyebrow mb-5">Everything in one place</p>
          <h2 className="text-[34px] leading-[1.12] font-medium tracking-[-0.03em] text-text">
            A portfolio that keeps up with the work.
          </h2>
          <p className="mt-5 text-[14px] leading-relaxed text-muted">
            Import your public repositories, curate what matters, choose a layout that suits your discipline, and publish
            to a real URL. No drag-and-drop theatre.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              ["Authentic publishing", "Server-enforced ownership, draft previews and a public URL you control."],
              ["GitHub synchronisation", "Repositories discovered from the API, then curated by you — never invented."],
              ["Four layout engines", "Signal, Monograph, Atlas and Terminal — different structure, not different colours."],
            ].map(([title, detail]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mint" aria-hidden />
                <div>
                  <p className="text-[13px] font-medium text-text-2">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
          Folio · Built by Israel Kolawole
        </p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href={backHref}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {backLabel}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[26px] leading-tight font-medium tracking-[-0.02em]">{title}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-[12.5px] text-muted">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
