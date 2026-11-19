"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/**
 * Destructive form with a deliberate two-step confirmation.
 * Uses an inline panel (not window.confirm) so it is keyboard accessible,
 * announced to screen readers and consistent with the design system.
 */
export function ConfirmForm({
  action,
  title,
  description,
  triggerLabel,
  confirmLabel,
  children,
  variant = "danger",
  size = "sm",
}: {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  description: string;
  triggerLabel: string;
  confirmLabel: string;
  children?: ReactNode;
  variant?: "danger" | "secondary";
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);

  return (
    <form action={action} className="inline-block">
      {children}
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={buttonClasses(variant, size)}>
          {triggerLabel}
        </button>
      ) : (
        <span className="inline-flex flex-wrap items-center gap-2 rounded-[10px] border border-danger/25 bg-danger/[0.06] p-2" role="group" aria-label={title}>
          <span className="max-w-[240px] px-1 text-[11.5px] leading-snug text-text-2">{description}</span>
          <ConfirmButton label={confirmLabel} />
          <button type="button" onClick={() => setOpen(false)} className={buttonClasses("ghost", "sm")}>
            Cancel
          </button>
        </span>
      )}
    </form>
  );
}

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClasses("danger", "sm")}>
      {pending && <Loader2 className="size-3 animate-spin" aria-hidden />}
      {label}
    </button>
  );
}
