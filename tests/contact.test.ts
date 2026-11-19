import { beforeEach, describe, expect, it } from "vitest";
import { submitContactAction } from "@/app/actions/contact";
import { db, createAccount, form, resetDatabase, resetRequest } from "./support/fixtures";

beforeEach(async () => {
  await resetDatabase();
  resetRequest();
});

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Geoscience data project",
  message: "I would like to discuss a subsurface document workflow with you.",
};

describe("contact form", () => {
  it("stores a genuine message against the owner's portfolio", async () => {
    const owner = await createAccount({ email: "owner@folio.local", role: "OWNER" });
    const result = await submitContactAction(undefined, form(valid));

    expect(result.ok).toBe(true);
    const messages = await db.contactMessage.findMany({ where: { userId: owner.user.id } });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Geoscience data project",
      portfolioId: owner.portfolio.id,
      read: false,
    });
  });

  it("returns field errors and stores nothing for an invalid message", async () => {
    await createAccount({ email: "owner@folio.local", role: "OWNER" });
    const result = await submitContactAction(undefined, form({ ...valid, message: "hi", email: "nope" }));

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.message).toBeTruthy();
    expect(result.fieldErrors?.email).toBeTruthy();
    expect(await db.contactMessage.count()).toBe(0);
  });

  it("pretends success for a bot that fills the honeypot", async () => {
    await createAccount({ email: "owner@folio.local", role: "OWNER" });
    const result = await submitContactAction(undefined, form({ ...valid, website: "http://spam.example" }));

    expect(result.ok).toBe(true);
    expect(await db.contactMessage.count()).toBe(0);
  });

  it("tells the visitor when no owner account exists", async () => {
    const result = await submitContactAction(undefined, form(valid));
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not accepting messages");
    expect(await db.contactMessage.count()).toBe(0);
  });

  it("rate limits a flood of messages from one connection", async () => {
    await createAccount({ email: "owner@folio.local", role: "OWNER" });
    for (let index = 0; index < 5; index += 1) {
      const result = await submitContactAction(undefined, form({ ...valid, message: `${valid.message} (${index})` }));
      expect(result.ok).toBe(true);
    }
    const limited = await submitContactAction(undefined, form(valid));
    expect(limited.ok).toBe(false);
    expect(limited.message).toContain("Too many messages");
    expect(await db.contactMessage.count()).toBe(5);
  });
});
