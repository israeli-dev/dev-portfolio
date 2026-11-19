/**
 * Canonical origin for metadata, sitemap entries and reset links.
 *
 * `NEXT_PUBLIC_SITE_URL` is the explicit setting. When it is missing — a fresh
 * Vercel import, or a preview deployment — fall back to the host Vercel already
 * knows about instead of emitting `localhost` into Open Graph tags and emails.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}
