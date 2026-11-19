import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "mint" | "sand" | "danger";
  className?: string;
}) {
  const tones = {
    default: "text-text",
    mint: "text-mint",
    sand: "text-sand",
    danger: "text-danger",
  };
  return (
    <div className={cn("rounded-xl border border-line bg-white/[0.02] p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">{label}</p>
        {icon && <span className="text-muted/70">{icon}</span>}
      </div>
      <p className={cn("mt-2 text-[22px] leading-none font-medium tracking-[-0.02em]", tones[tone])}>{value}</p>
      {hint && <p className="mt-2 text-[10.5px] leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}
