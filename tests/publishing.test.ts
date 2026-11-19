import { beforeEach, describe, expect, it } from "vitest";
import { setPublishedAction } from "@/app/actions/portfolio";
import { getPortfolioForUser, getPublishedPortfolio, getPlatformStats } from "@/lib/queries";
import { toPortfolioView } from "@/lib/portfolio-view";
import { createProject, db, createAccount, form, resetDatabase, resetRequest } from "./support/fixtures";
import { expectRedirect, signInAs } from "./support/request";
import { DEFAULT_SECTIONS } from "@/lib/domain";

beforeEach(async () => {
  await resetDatabase();
  resetRequest();
});

describe("publishing", () => {
  it("publishes a draft, stamps the date and logs the change", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    await expectRedirect(setPublishedAction(form({ published: "true", redirectTo: "/dashboard" })), "/dashboard");

    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved!.published).toBe(true);
    expect(saved!.publishedAt).toBeInstanceOf(Date);
    expect(await db.activityLog.count({ where: { portfolioId: portfolio.id, action: "portfolio.published" } })).toBe(1);
  });

  it("unpublishes but keeps the original publication date", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com", published: true });
    await signInAs(user.id);
    const originalDate = portfolio.publishedAt!.getTime();

    await expectRedirect(setPublishedAction(form({ published: "false", redirectTo: "/dashboard" })), "/dashboard");

    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved!.published).toBe(false);
    expect(saved!.publishedAt!.getTime()).toBe(originalDate);
  });

  it("hides unpublished portfolios from the public query", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    expect(await getPublishedPortfolio(portfolio.slug)).toBeNull();

    await signInAs(user.id);
    await expectRedirect(setPublishedAction(form({ published: "true" })), "/dashboard");

    const published = await getPublishedPortfolio(portfolio.slug);
    expect(published).not.toBeNull();
    expect(published!.slug).toBe(portfolio.slug);
  });

  it("allows the owner's dashboard to load a draft by flag only", async () => {
    const { portfolio } = await createAccount({ email: "maker@example.com" });
    const draft = await getPublishedPortfolio(portfolio.slug, true);
    expect(draft).not.toBeNull();
    expect(draft!.published).toBe(false);
  });

  it("counts only live, curated projects in public statistics", async () => {
    const { portfolio } = await createAccount({ email: "maker@example.com", published: true });
    await createProject(portfolio.id, { published: true });
    await createProject(portfolio.id, { published: true, excluded: true });
    await createProject(portfolio.id, { published: false });

    const stats = await getPlatformStats();
    expect(stats).toMatchObject({ projectCount: 1, publishedCount: 1 });
  });
});

describe("public view model", () => {
  it("drops hidden sections, excluded projects and unpublished projects", async () => {
    const sections = DEFAULT_SECTIONS.map((section) => ({ ...section, visible: section.id !== "contact" }));
    const { user, portfolio } = await createAccount({ email: "maker@example.com", published: true, sections });
    await createProject(portfolio.id, { name: "Visible", published: true, sortOrder: 0 });
    await createProject(portfolio.id, { name: "Hidden", published: false, sortOrder: 1 });
    await createProject(portfolio.id, { name: "Excluded", published: true, excluded: true, sortOrder: 2 });
    await createProject(portfolio.id, { name: "Pinned", published: true, featured: true, sortOrder: 3 });
    void user;

    const loaded = await getPublishedPortfolio(portfolio.slug);
    const view = toPortfolioView(loaded!);

    expect(view.projects.map((project) => project.name)).toEqual(["Pinned", "Visible"]);
    expect(view.sections.find((section) => section.id === "contact")?.visible).toBe(false);
  });

  it("keeps in-development projects labelled honestly", async () => {
    const { portfolio } = await createAccount({ email: "maker@example.com", published: true });
    await createProject(portfolio.id, { name: "BADO", status: "in-development", progress: 35 });

    const view = toPortfolioView((await getPublishedPortfolio(portfolio.slug))!);
    expect(view.projects[0]).toMatchObject({ status: "in-development", progress: 35 });
  });
});

describe("dashboard data scoping", () => {
  it("returns each user only their own portfolio with related data", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const bob = await createAccount({ email: "bob@example.com" });
    await createProject(alice.portfolio.id, { name: "Alice project" });

    const aliceDashboard = await getPortfolioForUser(alice.user.id);
    const bobDashboard = await getPortfolioForUser(bob.user.id);

    expect(aliceDashboard!.projects.map((project) => project.name)).toEqual(["Alice project"]);
    expect(bobDashboard!.projects).toHaveLength(0);
    expect(aliceDashboard!.id).not.toBe(bobDashboard!.id);
  });
});
