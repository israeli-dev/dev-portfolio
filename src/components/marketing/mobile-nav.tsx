"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function MobileNav({
  links,
  signedIn,
  isOwner,
}: {
  links: { href: string; label: string }[];
  signedIn: boolean;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="rounded-md p-2 text-text-2 transition-colors hover:bg-white/[0.05] hover:text-text"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-x-3 top-3 rounded-2xl border border-line bg-surface p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-muted hover:bg-white/[0.05] hover:text-text"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-4 flex flex-col">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/60 py-3 text-[15px] text-text-2 transition-colors hover:text-text"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5 flex flex-col gap-2">
              {signedIn ? (
                <>
                  {isOwner && (
                    <Link href="/admin" onClick={() => setOpen(false)} className={buttonClasses("secondary", "md")}>
                      Admin console
                    </Link>
                  )}
                  <Link href="/dashboard" onClick={() => setOpen(false)} className={buttonClasses("primary", "md")}>
                    Open dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup" onClick={() => setOpen(false)} className={buttonClasses("primary", "md")}>
                    Build your portfolio
                  </Link>
                  <Link href="/login" onClick={() => setOpen(false)} className={buttonClasses("secondary", "md")}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
