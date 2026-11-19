import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  counter?: ReactNode;
}

export function FieldShell({ label, htmlFor, hint, error, required, children, className, counter }: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-text-2">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
        {counter}
      </div>
      {children}
      {hint && !error && <p className="text-[11.5px] leading-relaxed text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-[11.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };

export function Input({ label, hint, error, id, required, className, ...props }: InputProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint} error={error} required={required} className={className}>
      <input
        id={fieldId}
        className="field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
  currentLength?: number;
};

export function Textarea({ label, hint, error, id, required, className, showCount, currentLength, ...props }: TextareaProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      className={className}
      counter={
        showCount && typeof props.maxLength === "number" ? (
          <span className="font-mono text-[10.5px] text-muted">
            {currentLength ?? 0}/{props.maxLength}
          </span>
        ) : undefined
      }
    >
      <textarea
        id={fieldId}
        className="field min-h-[92px] resize-y leading-relaxed"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string };

export function Select({ label, hint, error, id, required, className, children, ...props }: SelectProps) {
  const fieldId = id ?? props.name ?? label;
  return (
    <FieldShell label={label} htmlFor={fieldId} hint={hint} error={error} required={required} className={className}>
      <select id={fieldId} className="field" required={required} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  hint,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const fieldId = id ?? props.name ?? label;
  return (
    <label htmlFor={fieldId} className={cn("flex cursor-pointer items-start gap-3 text-[13px] text-text-2", className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 appearance-none rounded-[4px] border border-line-strong bg-white/[0.03] checked:border-mint checked:bg-mint checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M3.5 8.5l3 3 6-6.5%22 stroke=%22%2304211c%22 stroke-width=%222%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')] checked:bg-center checked:bg-no-repeat"
        {...props}
      />
      <span>
        {label}
        {hint && <span className="mt-0.5 block text-[11.5px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}
