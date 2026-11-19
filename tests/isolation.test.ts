import { beforeEach, describe, expect, it } from "vitest";
import { deleteMessageAction, markMessageReadAction, updateProfileAction } from "@/app/actions/portfolio";
import { syncGithubAction } from "@/app/actions/github";
import { db, createAccount, form, resetDatabase, resetRequest } from "./support/fixtures";
import { expectRedirect, signInAs } from "./support/request";

beforeEach(async () => {
  await resetDatabase();
  resetRequest();
});

describe("tenant isolation", () => {
  it("refuses a profile update aimed at another user's portfolio id", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const bob = await createAccount({ email: "bob@example.com" });
    await signInAs(bob.user.id);

    await expectRedirect(
      updateProfileAction(undefined, form({ portfolioId: alice.portfolio.id, title: "Taken over" })),
      "/dashboard?denied=portfolio",
    );

    const untouched = await db.portfolio.findUnique({ where: { id: alice.portfolio.id } });
    expect(untouched!.title).toBe("Test Person");
  });

  it("lets the platform owner edit any portfolio deliberately", async () => {
    const member = await createAccount({ email: "member@example.com" });
    const admin = await createAccount({ email: "admin@example.com", role: "OWNER" });
    await signInAs(admin.user.id);

    const result = await updateProfileAction(undefined, form({ portfolioId: member.portfolio.id, title: "Reviewed by owner" }));
    expect(result.ok).toBe(true);

    const updated = await db.portfolio.findUnique({ where: { id: member.portfolio.id } });
    expect(updated!.title).toBe("Reviewed by owner");
  });

  it("requires a session for every mutating action", async () => {
    const account = await createAccount({ email: "member@example.com" });
    await expectRedirect(
      updateProfileAction(undefined, form({ portfolioId: account.portfolio.id, title: "Anonymous edit" })),
      "/login?next=/dashboard",
    );
    const untouched = await db.portfolio.findUnique({ where: { id: account.portfolio.id } });
    expect(untouched!.title).toBe("Test Person");
  });

  it("scopes contact messages to the portfolio they were sent to", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const bob = await createAccount({ email: "bob@example.com" });
    const message = await db.contactMessage.create({
      data: {
        userId: alice.user.id,
        portfolioId: alice.portfolio.id,
        name: "Recruiter",
        email: "recruiter@example.com",
        subject: "Role",
        message: "We are hiring for an applied AI role.",
      },
    });

    await signInAs(bob.user.id);
    await expectRedirect(markMessageReadAction(form({ id: message.id })), "/dashboard/inbox?denied=1");
    await expectRedirect(deleteMessageAction(form({ id: message.id })), "/dashboard/inbox?denied=1");

    const stillThere = await db.contactMessage.findUnique({ where: { id: message.id } });
    expect(stillThere).not.toBeNull();
    expect(stillThere!.read).toBe(false);
  });

  it("lets the recipient mark their own message read", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const message = await db.contactMessage.create({
      data: {
        userId: alice.user.id,
        portfolioId: alice.portfolio.id,
        name: "Recruiter",
        email: "recruiter@example.com",
        message: "Short enquiry that is long enough.",
      },
    });

    await signInAs(alice.user.id);
    await expectRedirect(markMessageReadAction(form({ id: message.id })), "/dashboard/inbox");

    const updated = await db.contactMessage.findUnique({ where: { id: message.id } });
    expect(updated!.read).toBe(true);
  });

  it("keeps GitHub connections per account", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const bob = await createAccount({ email: "bob@example.com" });

    await db.gitHubIntegration.create({
      data: {
        portfolioId: alice.portfolio.id,
        username: "alice",
      },
    });

    expect(await db.gitHubIntegration.count({ where: { portfolioId: alice.portfolio.id } })).toBe(1);
    expect(await db.gitHubIntegration.count({ where: { portfolioId: bob.portfolio.id } })).toBe(0);
  });

  it("rejects a GitHub sync without a session", async () => {
    await expectRedirect(syncGithubAction(form({})), "/login?next=/dashboard/github");
  });
});
