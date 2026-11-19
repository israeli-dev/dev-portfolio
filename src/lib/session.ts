import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { createOpaqueToken, hashToken } from "@/lib/crypto";
import type { SessionRow } from "@/lib/rows";

export const SESSION_COOKIE = "folio_session";
export const SESSION_TTL_DAYS = 14;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "OWNER";
}

/**
 * Create a session row and set the HttpOnly cookie. Only the SHA-256 hash of
 * the token is persisted, so a database leak cannot be replayed as a cookie.
 */
export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ip?: string | null } = {},
): Promise<void> {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: meta.userAgent?.slice(0, 300) ?? null,
      ip: meta.ip?.slice(0, 60) ?? null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Resolve the current user from the session cookie. Memoised per request so
 * layouts, pages and actions do not each hit the database.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = (await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  })) as (SessionRow & { user: SessionUser }) | null;

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  const role = session.user.role === "OWNER" ? "OWNER" : "USER";
  return { ...session.user, role };
});

/** Remove expired sessions and one-time tokens. Cheap enough to call on auth. */
export async function pruneAuthArtifacts(): Promise<void> {
  const now = new Date();
  await Promise.all([
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);
}
