import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-mint uppercase">404 — Not found</p>
      <h1 className="mt-4 max-w-md text-[28px] leading-tight font-medium tracking-[-0.02em] md:text-[36px]">
        This page either moved, or was never published.
      </h1>
      <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted">
        Published portfolios live at <span className="font-mono text-text-2">/u/handle</span>. Unpublished drafts are only
        visible to their owner.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary", "md")}>Back to the portfolio</Link>
        <Link href="/projects" className={buttonClasses("secondary", "md")}>Browse projects</Link>
      </div>
    </div>
  );
}
