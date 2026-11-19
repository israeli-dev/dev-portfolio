/**
 * Public portfolio skeleton — mirrors the template frame so the transition from
 * click to content is smooth on slow connections.
 */
export default function PortfolioLoading() {
  return (
    <div className="min-h-dvh bg-[#08090b] text-[#e7e9ec]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading portfolio</span>
      <div className="mx-auto max-w-5xl animate-pulse px-5 py-14 md:px-10 md:py-20">
        <div className="h-2.5 w-32 rounded-full bg-white/5" />
        <div className="mt-8 h-12 w-3/4 max-w-lg rounded-md bg-white/5" />
        <div className="mt-4 h-4 w-1/2 max-w-sm rounded-full bg-white/[0.04]" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 rounded-lg border border-white/[0.06] bg-white/[0.02]" />
          ))}
        </div>
        <div className="mt-10 space-y-3">
          <div className="h-3 w-full max-w-2xl rounded-full bg-white/[0.035]" />
          <div className="h-3 w-11/12 max-w-xl rounded-full bg-white/[0.035]" />
          <div className="h-3 w-2/3 max-w-md rounded-full bg-white/[0.035]" />
        </div>
      </div>
    </div>
  );
}
