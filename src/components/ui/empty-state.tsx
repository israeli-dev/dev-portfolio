import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      {icon && <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-line bg-white/[0.03] text-muted">{icon}</div>}
      <p className="text-[14px] font-medium text-text">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
