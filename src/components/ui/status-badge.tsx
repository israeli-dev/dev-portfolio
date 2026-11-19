import { statusMeta, PROJECT_STATUSES } from "@/lib/domain";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, { dot: string; text: string; border: string; bg: string }> = {
  live: { dot: "bg-mint shadow-[0_0_0_3px_rgba(125,211,192,0.16)]", text: "text-mint", border: "border-mint/25", bg: "bg-mint/[0.07]" },
  complete: { dot: "bg-sky", text: "text-sky", border: "border-sky/25", bg: "bg-sky/[0.07]" },
  active: { dot: "bg-sand animate-[pulseSoft_3.6s_ease-in-out_infinite]", text: "text-sand", border: "border-sand/25", bg: "bg-sand/[0.07]" },
  experiment: { dot: "bg-[#c9a7eb]", text: "text-[#c9a7eb]", border: "border-[#c9a7eb]/25", bg: "bg-[#c9a7eb]/[0.07]" },
  planned: { dot: "bg-muted", text: "text-muted", border: "border-line-strong", bg: "bg-white/[0.03]" },
  archived: { dot: "bg-[#6b7480]", text: "text-[#8b949e]", border: "border-line", bg: "bg-white/[0.02]" },
};

export function StatusBadge({ status, size = "md", className }: { status: string; size?: "sm" | "md"; className?: string }) {
  const meta = statusMeta(status);
  const tone = TONE_STYLES[meta.tone] ?? TONE_STYLES.planned;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-mono uppercase tracking-[0.08em]",
        size === "sm" ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[10px]",
        tone.border,
        tone.bg,
        tone.text,
        className,
      )}
    >
      <span className={cn("status-dot", tone.dot)} aria-hidden />
      {meta.short}
    </span>
  );
}

/** Legend explaining the status system, used on the projects index. */
export function StatusLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {PROJECT_STATUSES.map((status) => (
        <StatusBadge key={status.id} status={status.id} size="sm" />
      ))}
    </div>
  );
}
