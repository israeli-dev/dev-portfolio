import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "mint" | "sand" | "danger" | "sky" | "moss" }) {
  const tones = {
    neutral: "border-line bg-white/[0.03] text-text-2",
    mint: "border-mint/25 bg-mint/10 text-mint",
    sand: "border-sand/25 bg-sand/10 text-sand",
    danger: "border-danger/25 bg-danger/10 text-danger",
    sky: "border-sky/25 bg-sky/10 text-sky",
    moss: "border-moss/25 bg-moss/10 text-moss",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] tracking-[0.07em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
