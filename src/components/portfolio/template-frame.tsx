import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Scaled, non-interactive preview frame. Renders the real template at desktop
 * width and clips it, so what a visitor previews is exactly what publishes.
 */
export function TemplateFrame({
  children,
  className,
  scale = "0.38",
  height = "380px",
  label,
}: {
  children: ReactNode;
  className?: string;
  scale?: string;
  height?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border border-line bg-ink", className)}
      style={{ height }}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <div
        className="pointer-events-none absolute top-0 left-0 w-[1280px] origin-top-left"
        style={{ transform: `scale(${scale})` }}
        aria-hidden
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" aria-hidden />
    </div>
  );
}
