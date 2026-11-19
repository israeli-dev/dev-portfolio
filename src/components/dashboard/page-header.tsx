import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 font-mono text-[9.5px] tracking-[0.14em] text-mint uppercase">{eyebrow}</p>}
        <h1 className="text-[24px] leading-tight font-medium tracking-[-0.02em] md:text-[28px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
