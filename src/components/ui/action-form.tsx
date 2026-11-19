"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function ActionForm({
  action,
  children,
  footer,
  className,
  successMessage,
  id,
  noValidate,
}: {
  action: Action;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  successMessage?: string;
  id?: string;
  noValidate?: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(action, undefined);
  const router = useRouter();
  const fieldErrors = state?.fieldErrors ? Object.entries(state.fieldErrors) : [];

  // Refresh server-rendered data (previews, counts) after a successful save.
  useEffect(() => {
    if (state?.ok && !state.data?.resetPath) router.refresh();
  }, [state, router]);

  return (
    <form id={id} action={formAction} className={cn("space-y-5", className)} noValidate={noValidate}>
      {state?.ok && (state.message || successMessage) && (
        <div role="status" className="flex items-start gap-2.5 rounded-[10px] border border-mint/25 bg-mint/[0.07] px-3.5 py-3 text-[12.5px] text-mint">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{state.message || successMessage}</span>
        </div>
      )}

      {state && !state.ok && (
        <div role="alert" className="flex items-start gap-2.5 rounded-[10px] border border-danger/25 bg-danger/[0.07] px-3.5 py-3 text-[12.5px] text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p>{state.message ?? "Something went wrong. Please try again."}</p>
            {fieldErrors.length > 0 && (
              <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[11.5px] text-danger/90">
                {fieldErrors.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {children}
      {footer}
    </form>
  );
}

/** Client-side validation hint helper used by textareas and URL fields. */
export function FormHint({ children }: { children: ReactNode }) {
  return <p className="text-[11.5px] leading-relaxed text-muted">{children}</p>;
}
