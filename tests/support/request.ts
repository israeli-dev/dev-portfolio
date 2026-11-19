import { expect } from "vitest";
import { db } from "@/lib/db";
import { createOpaqueToken, hashToken } from "@/lib/crypto";

/**
 * Minimal stand-in for the Next.js request context.
 *
 * The cookie store mimics the subset of the `cookies()` API used by
 * `src/lib/session.ts`, so signing in inside a test produces a genuine session
 * row and a genuine cookie.
 */

export const SESSION_COOKIE = "folio_session";

interface StoredCookie {
  name: string;
  value: string;
  options?: unknown;
}

const jar = new Map<string, StoredCookie>();

export const cookieStore = {
  get(name: string) {
    return jar.get(name);
  },
  getAll() {
    return [...jar.values()];
  },
  has(name: string) {
    return jar.has(name);
  },
  set(name: string, value: string, options?: unknown) {
    jar.set(name, { name, value, options });
  },
  delete(name: string) {
    jar.delete(name);
  },
};

export const headerStore = new Headers({
  "user-agent": "vitest/smoke",
  "x-forwarded-for": "203.0.113.7",
});

/** Throwing redirect, matching Next.js server-action semantics. */
export function redirect(path: string): never {
  const error = new Error(`NEXT_REDIRECT:${path}`) as Error & { digest: string };
  error.digest = `NEXT_REDIRECT;replace;${path};307;`;
  throw error;
}

export function clearRequestState(): void {
  jar.clear();
}

/** Create a real session row and put its token in the cookie jar. */
export async function signInAs(userId: string): Promise<string> {
  const token = createOpaqueToken();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      userAgent: "vitest",
      ip: "203.0.113.7",
    },
  });
  jar.set(SESSION_COOKIE, { name: SESSION_COOKIE, value: token });
  return token;
}

/** Simulate a browser presenting an arbitrary (possibly stale) token. */
export function presentToken(token: string): void {
  jar.set(SESSION_COOKIE, { name: SESSION_COOKIE, value: token });
}

export function expectRedirect(promise: Promise<unknown>, path: string) {
  return expect(promise).rejects.toThrow(`NEXT_REDIRECT:${path}`);
}
