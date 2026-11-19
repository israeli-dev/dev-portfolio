import { Check, Circle } from "lucide-react";
import { completeness, type CompletenessResult } from "@/lib/domain";
import type { CompletenessInput } from "@/lib/domain";

export function buildCompleteness(input: CompletenessInput): CompletenessResult {
  return completeness(input);
}

export function CompletenessRing({ score, size = 76 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7DD3C0"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[13px] text-text">{score}%</span>
    </div>
  );
}

export function CompletenessChecklist({ checks }: { checks: CompletenessResult["checks"] }) {
  return (
    <ul className="space-y-2">
      {checks.map((check) => (
        <li key={check.id} className="flex items-center gap-2.5 text-[11.5px]">
          {check.done ? (
            <Check className="size-3.5 shrink-0 text-mint" aria-hidden />
          ) : (
            <Circle className="size-3.5 shrink-0 text-muted/40" aria-hidden />
          )}
          <span className={check.done ? "text-text-2" : "text-muted"}>{check.label}</span>
          <span className="sr-only">{check.done ? "complete" : "incomplete"}</span>
        </li>
      ))}
    </ul>
  );
}
