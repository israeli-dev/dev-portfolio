/**
 * Dashboard skeleton. Rendered by the App Router while a server component is
 * streaming, so navigation never shows a blank screen.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-8 md:px-8 md:py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading dashboard</span>
      <div className="h-3 w-24 rounded-full bg-white/5" />
      <div className="mt-5 h-8 w-72 max-w-full rounded-md bg-white/5" />
      <div className="mt-3 h-3 w-96 max-w-full rounded-full bg-white/[0.035]" />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="h-2.5 w-16 rounded-full bg-white/5" />
            <div className="mt-4 h-6 w-20 rounded bg-white/5" />
            <div className="mt-3 h-2.5 w-24 rounded-full bg-white/[0.035]" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-64 rounded-lg border border-white/[0.06] bg-white/[0.02]" />
        <div className="h-64 rounded-lg border border-white/[0.06] bg-white/[0.02]" />
      </div>
    </div>
  );
}
