import { beforeEach, describe, expect, it } from "vitest";
import {
  requestPasswordResetAction,
  requireOwner,
  requireUser,
  resetPasswordAction,
  signInAction,
  signOutAction,
  signUpAction,
} from "@/app/actions/auth";
import { hashPassword, hashToken, verifyPassword } from "@/lib/crypto";
import { db } from "@/lib/db";
import { createAccount, form, resetDatabase, resetRequest } from "./support/fixtures";
import { cookieStore, expectRedirect, signInAs } from "./support/request";

beforeEach(async () => {
  await resetDatabase();
  resetRequest();
});

describe("password hashing", () => {
  it("stores a salted scrypt hash, never the plaintext", async () => {
    const hash = await hashPassword("correct-horse-9");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    expect(hash).not.toContain("correct-horse-9");
    expect(await verifyPassword("correct-horse-9", hash)).toBe(true);
    expect(await verifyPassword("correct-horse-8", hash)).toBe(false);
  });

  it("salts each hash so equal passwords differ", async () => {
    const [a, b] = await Promise.all([hashPassword("correct-horse-9"), hashPassword("correct-horse-9")]);
    expect(a).not.toBe(b);
  });
});

describe("sign up", () => {
  it("creates the account, an unpublished draft and a session", async () => {
    await expectRedirect(
      signUpAction(undefined, form({ name: "Ada Lovelace", email: "Ada@Example.com", password: "correct-horse-9" })),
      "/dashboard/wizard",
    );

    const user = await db.user.findUnique({ where: { email: "ada@example.com" } });
    expect(user).not.toBeNull();
    expect(user!.role).toBe("USER");
    expect(user!.passwordHash.startsWith("scrypt$")).toBe(true);

    const portfolio = await db.portfolio.findFirst({ where: { userId: user!.id } });
    expect(portfolio).not.toBeNull();
    expect(portfolio!.published).toBe(false);
    expect(portfolio!.slug).toBe("ada-lovelace");

    expect(cookieStore.get("folio_session")?.value).toBeTruthy();
    expect(await db.session.count({ where: { userId: user!.id } })).toBe(1);
  });

  it("refuses a duplicate email and keeps the original account intact", async () => {
    await createAccount({ email: "taken@example.com" });
    const result = await signUpAction(undefined, form({ name: "Someone Else", email: "taken@example.com", password: "correct-horse-9" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.email).toBeTruthy();
    expect(await db.user.count()).toBe(1);
  });

  it("refuses a weak password without creating anything", async () => {
    const result = await signUpAction(undefined, form({ name: "Ada", email: "ada@example.com", password: "allletterslong" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.password).toContain("letter");
    expect(await db.user.count()).toBe(0);
    expect(await db.portfolio.count()).toBe(0);
  });

  it("ignores a crafted role field — no self-service admin", async () => {
    const payload = form({ name: "Ada", email: "ada@example.com", password: "correct-horse-9" });
    payload.append("role", "OWNER");
    await expectRedirect(signUpAction(undefined, payload), "/dashboard/wizard");
    const user = await db.user.findUnique({ where: { email: "ada@example.com" } });
    expect(user!.role).toBe("USER");
  });

  it("gives two identically named users distinct handles", async () => {
    await expectRedirect(
      signUpAction(undefined, form({ name: "Sam Doe", email: "first@example.com", password: "correct-horse-9" })),
      "/dashboard/wizard",
    );
    await expectRedirect(
      signUpAction(undefined, form({ name: "Sam Doe", email: "second@example.com", password: "correct-horse-9" })),
      "/dashboard/wizard",
    );
    const portfolios = await db.portfolio.findMany({ where: { slug: { startsWith: "sam-doe" } } });
    expect(portfolios.length).toBe(2);
    expect(new Set(portfolios.map((portfolio) => portfolio.slug)).size).toBe(2);
  });
});

describe("sign in", () => {
  it("rejects a wrong password with a generic message and no session", async () => {
    await createAccount({ email: "owner@example.com" });
    const result = await signInAction(undefined, form({ email: "owner@example.com", password: "wrong-password-1" }));
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Those credentials do not match our records.");
    expect(await db.session.count()).toBe(0);
    expect(cookieStore.get("folio_session")).toBeUndefined();
  });

  it("does not reveal whether an email exists", async () => {
    await createAccount({ email: "owner@example.com" });
    const unknown = await signInAction(undefined, form({ email: "ghost@example.com", password: "correct-horse-9" }));
    const wrong = await signInAction(undefined, form({ email: "owner@example.com", password: "correct-horse-8" }));
    expect(unknown.message).toBe(wrong.message);
  });

  it("signs a normal user in and sends them to their dashboard", async () => {
    const { user } = await createAccount({ email: "user@example.com", password: "correct-horse-9" });
    await expectRedirect(signInAction(undefined, form({ email: "User@Example.com", password: "correct-horse-9" })), "/dashboard");
    expect(await db.session.count({ where: { userId: user.id } })).toBe(1);
  });

  it("sends the platform owner to the admin console", async () => {
    await createAccount({ email: "admin@example.com", role: "OWNER", password: "correct-horse-9" });
    await expectRedirect(signInAction(undefined, form({ email: "admin@example.com", password: "correct-horse-9" })), "/admin");
  });

  it("signs out by deleting the session row and cookie", async () => {
    const { user } = await createAccount({ email: "user@example.com" });
    await signInAs(user.id);
    expect(await db.session.count()).toBe(1);
    await expectRedirect(signOutAction(), "/");
    expect(await db.session.count()).toBe(0);
    expect(cookieStore.get("folio_session")).toBeUndefined();
  });
});

describe("password reset", () => {
  it("answers generically for unknown addresses and creates no token", async () => {
    const result = await requestPasswordResetAction(undefined, form({ email: "ghost@example.com" }));
    expect(result.ok).toBe(true);
    expect(result.data?.resetPath).toBeUndefined();
    expect(await db.passwordResetToken.count()).toBe(0);
  });

  it("issues a single-use token, updates the password and revokes live sessions", async () => {
    const { user } = await createAccount({ email: "user@example.com", password: "correct-horse-9" });
    await signInAs(user.id);

    const requested = await requestPasswordResetAction(undefined, form({ email: "user@example.com" }));
    expect(requested.ok).toBe(true);
    const path = requested.data?.resetPath;
    expect(path).toBeTruthy();
    expect(await db.passwordResetToken.count()).toBe(1);

    const token = decodeURIComponent(path!.split("token=")[1]);
    await expectRedirect(
      resetPasswordAction(undefined, form({ token, password: "brand-new-pass-7", confirm: "brand-new-pass-7" })),
      "/login?reset=1",
    );

    const updated = await db.user.findUnique({ where: { id: user.id } });
    expect(await verifyPassword("brand-new-pass-7", updated!.passwordHash)).toBe(true);
    expect(await verifyPassword("correct-horse-9", updated!.passwordHash)).toBe(false);
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);

    const tokenRow = await db.passwordResetToken.findFirst({ where: { userId: user.id } });
    expect(tokenRow!.usedAt).toBeInstanceOf(Date);
  });

  it("refuses to reuse a spent token", async () => {
    const { user } = await createAccount({ email: "user@example.com" });
    const requested = await requestPasswordResetAction(undefined, form({ email: "user@example.com" }));
    const token = decodeURIComponent(requested.data!.resetPath!.split("token=")[1]);

    await expectRedirect(
      resetPasswordAction(undefined, form({ token, password: "brand-new-pass-7", confirm: "brand-new-pass-7" })),
      "/login?reset=1",
    );

    const second = await resetPasswordAction(undefined, form({ token, password: "another-pass-11", confirm: "another-pass-11" }));
    expect(second.ok).toBe(false);
    expect(second.message).toContain("invalid or has expired");

    const user2 = await db.user.findUnique({ where: { id: user.id } });
    expect(await verifyPassword("brand-new-pass-7", user2!.passwordHash)).toBe(true);
  });

  it("refuses an expired token", async () => {
    const { user } = await createAccount({ email: "user@example.com" });
    const token = "expired-token-value-123456";
    await db.passwordResetToken.create({
      data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() - 1000) },
    });
    const result = await resetPasswordAction(undefined, form({ token, password: "brand-new-pass-7", confirm: "brand-new-pass-7" }));
    expect(result.ok).toBe(false);
  });

  it("rejects mismatched confirmation before touching the database", async () => {
    const { user } = await createAccount({ email: "user@example.com" });
    const requested = await requestPasswordResetAction(undefined, form({ email: "user@example.com" }));
    const token = decodeURIComponent(requested.data!.resetPath!.split("token=")[1]);
    const result = await resetPasswordAction(undefined, form({ token, password: "brand-new-pass-7", confirm: "different-pass-7" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.confirm).toBe("Passwords do not match");
  });
});

describe("route guards", () => {
  it("sends anonymous visitors to the login screen", async () => {
    await expectRedirect(requireUser(), "/login?next=/dashboard");
    await expectRedirect(requireOwner(), "/login?next=/admin");
  });

  it("blocks signed-in users from admin routes", async () => {
    const { user } = await createAccount({ email: "user@example.com" });
    await signInAs(user.id);
    await expect(requireUser()).resolves.toMatchObject({ id: user.id });
    await expectRedirect(requireOwner(), "/dashboard?denied=admin");
  });

  it("admits the owner", async () => {
    const { user } = await createAccount({ email: "admin@example.com", role: "OWNER" });
    await signInAs(user.id);
    await expect(requireOwner()).resolves.toMatchObject({ role: "OWNER" });
  });
});
