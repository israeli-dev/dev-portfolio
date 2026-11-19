"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  size = "md",
  className,
  formAction,
  name,
  value,
  disabled,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  name?: string;
  value?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={buttonClasses(variant, size, className)}
      formAction={formAction}
      name={name}
      value={value}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {pending ? pendingLabel : children}
    </button>
  );
}
