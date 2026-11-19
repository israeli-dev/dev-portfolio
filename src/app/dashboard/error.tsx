"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/**
 * Dashboard error boundary. Keeps the shell usable instead of crashing the
 * whole app, and offers a retry plus a safe way out.
 */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Dashboard error", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 md:px-8">
      <div className="rounded-xl border border-danger/25 bg-danger/[0.04] p-6 md:p-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-danger uppercase">Dashboard error</p>
        <h1 className="mt-3 text-[22px] font-medium tracking-[-0.02em]">That panel could not load.</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Your data is untouched. Retry the request; if it fails again, check the server log — the database may be
          unreachable or the schema out of date.
        </p>
        {error.digest && <p className="mt-3 font-mono text-[11px] text-text-2">Reference: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={reset} className={buttonClasses("primary", "md")}>
            Try again
          </button>
          <Link href="/dashboard" className={buttonClasses("secondary", "md")}>
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}
