import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Flash({
  message,
  tone = "success",
  className,
}: {
  message?: string;
  tone?: "success" | "error" | "info";
  className?: string;
}) {
  if (!message) return null;
  const tones = {
    success: "border-mint/25 bg-mint/[0.07] text-mint",
    error: "border-danger/25 bg-danger/[0.07] text-danger",
    info: "border-line bg-white/[0.03] text-text-2",
  };
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;

  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("mb-5 flex items-start gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[12px]", tones[tone], className)}>
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
