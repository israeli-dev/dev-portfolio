import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function Section({ id, eyebrow, title, description, action, children, className, bordered }: SectionProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-24", bordered && "border-t border-line", className)}>
      <div className="shell py-16 md:py-24">
        {(eyebrow || title || description) && (
          <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {eyebrow && (
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-mint" />
                  <span className="eyebrow">{eyebrow}</span>
                </div>
              )}
              {title && (
                <h2 className="text-[26px] leading-[1.12] font-medium tracking-[-0.02em] text-text sm:text-[32px] md:text-[40px]">
                  {title}
                </h2>
              )}
              {description && <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted md:text-[15px]">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
