/**
 * Small in-process fixed-window rate limiter.
 *
 * Adequate for a single Node instance and for local development. On serverless
 * or multi-replica deployments point this at a shared store (Upstash, Redis) —
 * see docs/DEPLOYMENT.md. In-memory limits are a defence-in-depth layer, not
 * the only protection: auth and upload endpoints also validate and authorize.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/** Test helper: clear all buckets between test cases. */
export function resetRateLimits(): void {
  buckets.clear();
}

/** Opportunistic cleanup so the map cannot grow without bound. */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientKey(headers: Headers | { get(name: string): string | null }, scope: string): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
