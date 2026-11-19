"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createOpaqueToken, hashPassword, hashToken, verifyPassword } from "@/lib/crypto";
import { createSession, destroySession, pruneAuthArtifacts, getCurrentUser } from "@/lib/session";
import { clientKey, pruneRateLimits, rateLimit } from "@/lib/rate-limit";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation";
import { safeRedirectPath, slugify } from "@/lib/utils";
import { sendEmail } from "@/lib/mail";
import { DEFAULT_SECTIONS } from "@/lib/domain";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "portfolio";
  const existing = await db.portfolio.findUnique({ where: { slug: root }, select: { id: true } });
  if (!existing) return root;
  return `${root}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function signUpAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  pruneRateLimits();
  const hdrs = await headers();
  const limited = rateLimit(clientKey(hdrs, "signup"), 5, 15 * 60 * 1000);
  if (!limited.ok) return actionError(`Too many sign-up attempts. Try again in ${limited.retryAfterSeconds}s.`);

  const parsed = signUpSchema.safeParse({
    name: readField(formData, "name"),
    email: readField(formData, "email"),
    password: readField(formData, "password"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return actionError("Please check the form.", errors);
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return actionError("An account with that email already exists.", { email: "Email already registered" });

  const passwordHash = await hashPassword(password);
  const slug = await uniqueSlug(name);

  const user = await db.user.create({
    data: { name, email, passwordHash, role: "USER" },
  });

  const portfolio = await db.portfolio.create({
    data: {
      userId: user.id,
      slug,
      title: name,
      headline: "",
      bio: "",
      sections: JSON.stringify(DEFAULT_SECTIONS),
      published: false,
    },
  });

  await db.activityLog.create({
    data: {
      portfolioId: portfolio.id,
      action: "portfolio.created",
      detail: "Portfolio draft created",
    },
  });

  await createSession(user.id, { userAgent: hdrs.get("user-agent"), ip: hdrs.get("x-forwarded-for") });

  const next = safeRedirectPath(formData.get("next"), "/dashboard/wizard");
  redirect(next);
}

export async function signInAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  pruneRateLimits();
  const hdrs = await headers();
  const emailGuess = readField(formData, "email").toLowerCase().slice(0, 120);
  const limited = rateLimit(clientKey(hdrs, "signin") + `:${emailGuess}`, 8, 15 * 60 * 1000);
  if (!limited.ok) return actionError(`Too many attempts. Try again in ${limited.retryAfterSeconds}s.`);

  const parsed = signInSchema.safeParse({
    email: readField(formData, "email"),
    password: readField(formData, "password"),
  });
  if (!parsed.success) {
    return actionError("Enter your email and password.", {});
  }

  await pruneAuthArtifacts();

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !valid) {
    // Same message for unknown email and wrong password — no account enumeration.
    return actionError("Those credentials do not match our records.");
  }

  await createSession(user.id, { userAgent: hdrs.get("user-agent"), ip: hdrs.get("x-forwarded-for") });
  const next = safeRedirectPath(formData.get("next"), user.role === "OWNER" ? "/admin" : "/dashboard");
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  pruneRateLimits();
  const hdrs = await headers();
  const limited = rateLimit(clientKey(hdrs, "reset-request"), 4, 15 * 60 * 1000);
  if (!limited.ok) return actionError(`Too many requests. Try again in ${limited.retryAfterSeconds}s.`);

  const parsed = forgotPasswordSchema.safeParse({ email: readField(formData, "email") });
  if (!parsed.success) return actionError("Enter a valid email address.", { email: "Enter a valid email address" });

  const user = await db.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, email: true } });

  // Always answer generically. The token is only created for real accounts.
  if (!user) {
    return actionOk("If an account exists for that address, a reset link has been created.");
  }

  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const token = createOpaqueToken();
  await db.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const resetPath = `/reset-password?token=${encodeURIComponent(token)}`;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const delivery = await sendEmail({
    to: user.email,
    subject: "Reset your Folio password",
    text: [
      "Someone requested a password reset for your Folio account.",
      "",
      `Reset link (valid for 30 minutes, single use): ${origin}${resetPath}`,
      "",
      "If this was not you, ignore this email — your password is unchanged.",
    ].join("\n"),
  });

  if (delivery.sent) {
    return actionOk("If an account exists for that address, a reset link has been sent.");
  }

  // No provider configured (or it failed): surface the link to the browser in
  // development only — never in production.
  if (process.env.NODE_ENV !== "production") {
    return actionOk("Reset link generated. No email provider configured — use the link below (development only).", {
      resetPath,
    });
  }

  return actionOk("If an account exists for that address, a reset link has been sent.");
}

export async function resetPasswordAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: readField(formData, "token"),
    password: readField(formData, "password"),
    confirm: readField(formData, "confirm"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return actionError("Please check the form.", errors);
  }

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return actionError("That reset link is invalid or has expired. Request a new one.");
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Invalidate every existing session after a password change.
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);

  redirect("/login?reset=1");
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return user;
}

export async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "OWNER") redirect("/dashboard?denied=admin");
  return user;
}
