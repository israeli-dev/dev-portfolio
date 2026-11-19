type ClassValue = string | number | null | undefined | false | ClassValue[];

/** Tiny class-name joiner — avoids pulling in clsx/tailwind-merge for this app. */
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 1)
    .filter((value): value is string | number => Boolean(value))
    .join(" ");
}

export function formatDate(value: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", opts ?? { month: "short", year: "numeric" }).format(date);
}

export function relativeTime(value: Date | string | null | undefined): string {
  if (!value) return "never";
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(value: string, max = 160): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

const SAFE_PATH = /^\/[a-zA-Z0-9\-._~/?#[\]@!$&'()*+,;=%]*$/;

/** Only allow same-origin relative paths as post-auth redirect targets. */
export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined, fallback = "/dashboard"): string {
  const path = String(value ?? "");
  if (!path.startsWith("/") || path.startsWith("//") || !SAFE_PATH.test(path)) return fallback;
  return path;
}
