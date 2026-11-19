import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: an aperture/strata monogram — the same mark used in the favicon. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("size-7", className)}>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0E1114" stroke="rgba(255,255,255,0.14)" />
      <path d="M8 21.5c2.6 0 3.4-11 7-11s4.4 11 9 11" stroke="#7DD3C0" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 25h16" stroke="#E0A458" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11" cy="9" r="1.4" fill="#E0A458" />
    </svg>
  );
}

export function Logo({ href = "/", subtitle }: { href?: string; subtitle?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="Folio home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-medium tracking-[-0.01em] text-text">Folio</span>
        {subtitle && <span className="mt-1 font-mono text-[9.5px] tracking-[0.14em] text-muted uppercase">{subtitle}</span>}
      </span>
    </Link>
  );
}
