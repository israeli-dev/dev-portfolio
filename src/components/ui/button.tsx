import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-mint text-[#04211c] hover:bg-[#8fdfcd] shadow-[0_10px_30px_-14px_rgba(125,211,192,0.65)] font-medium",
  secondary:
    "bg-white/[0.06] text-text border border-line hover:bg-white/[0.1] hover:border-line-strong",
  ghost: "text-text-2 hover:text-text hover:bg-white/[0.05]",
  outline: "border border-line-strong text-text hover:bg-white/[0.05]",
  danger: "bg-danger/12 text-danger border border-danger/30 hover:bg-danger/20",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px] rounded-[8px] gap-1.5",
  md: "h-10 px-4 text-[13.5px] rounded-[10px] gap-2",
  lg: "h-12 px-5 text-[14.5px] rounded-[11px] gap-2.5",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 disabled:opacity-45 disabled:pointer-events-none select-none",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  );
}
