"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Public-page error boundary. Stays inside the portfolio frame so a failure
 * still reads as part of this product rather than a bare browser error.
 */
export default function PortfolioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Portfolio rendering error", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#08090b] px-6 text-[#e7e9ec]">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-[10px] tracking-[0.22em] text-[#FF7A6B] uppercase">Portfolio unavailable</p>
        <h1 className="mt-4 text-[26px] font-medium tracking-[-0.02em]">This page could not be rendered.</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[#9aa1a9]">
          The portfolio exists, but something failed while loading it. Try again — if it persists the owner has been
          notified by the server log.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center rounded-md bg-[#e7e9ec] px-4 text-[13px] font-medium text-[#08090b] hover:bg-white"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md border border-white/12 px-4 text-[13px] text-[#e7e9ec] hover:border-white/25"
          >
            Go to Folio
          </Link>
        </div>
      </div>
    </div>
  );
}
