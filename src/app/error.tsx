"use client";

import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.2em] text-danger uppercase">Something broke</p>
      <h1 className="mt-4 text-[28px] font-medium tracking-[-0.02em]">This page could not be rendered.</h1>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-muted">
        The error has been logged. If it keeps happening, the cause is likely local configuration — check that{" "}
        <span className="font-mono text-text-2">npm run db:seed</span> has run, or that{" "}
        <span className="font-mono text-text-2">DATABASE_URL</span> points at a reachable database.
      </p>
      <button onClick={reset} className={buttonClasses("primary", "md", "mt-8")}>
        Try again
      </button>
    </div>
  );
}
