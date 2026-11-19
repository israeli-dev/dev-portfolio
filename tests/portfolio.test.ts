import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteProjectAction,
  saveSectionsAction,
  saveSkillAction,
  setProjectStateAction,
  toggleProjectFlagAction,
  updateAppearanceAction,
  updateProfileAction,
  updateSlugAction,
} from "@/app/actions/portfolio";
import { createProject } from "./support/fixtures";
import { db, createAccount, form, resetDatabase, resetRequest } from "./support/fixtures";
import { expectRedirect, signInAs } from "./support/request";
import { DEFAULT_SECTIONS, sectionsOrDefault } from "@/lib/domain";

beforeEach(async () => {
  await resetDatabase();
  resetRequest();
});

describe("profile editing", () => {
  it("persists profile fields and records an activity entry", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    const result = await updateProfileAction(
      undefined,
      form({
        title: "Israel Kolawole — AI Engineer",
        headline: "I build applied AI systems for subsurface and operations teams.",
        bio: "Geoscientist turned AI application developer. ".repeat(3),
        location: "Ibadan, Nigeria",
        email: "hello@example.com",
        availability: "Open to AI engineering roles",
        avatarUrl: "",
      }),
    );

    expect(result.ok).toBe(true);
    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved!.title).toBe("Israel Kolawole — AI Engineer");
    expect(saved!.location).toBe("Ibadan, Nigeria");
    expect(saved!.avatarUrl).toBeNull();
    expect(await db.activityLog.count({ where: { portfolioId: portfolio.id, action: "profile.updated" } })).toBe(1);
  });

  it("returns field errors and writes nothing when the title is empty", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    const result = await updateProfileAction(undefined, form({ title: "", headline: "Hello" }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.title).toBeTruthy();

    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved!.headline).toBe("");
  });
});

describe("handle and appearance", () => {
  it("changes the public handle", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    const result = await updateSlugAction(undefined, form({ slug: "israel-k" }));
    expect(result.ok).toBe(true);
    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved!.slug).toBe("israel-k");
  });

  it("refuses a handle another account already owns", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const bob = await createAccount({ email: "bob@example.com" });
    await signInAs(bob.user.id);

    const result = await updateSlugAction(undefined, form({ slug: alice.portfolio.slug }));
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.slug).toBe("Already taken");
    const untouched = await db.portfolio.findUnique({ where: { id: bob.portfolio.id } });
    expect(untouched!.slug).toBe("bob");
  });

  it("rejects an invalid handle", async () => {
    const { user } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    const result = await updateSlugAction(undefined, form({ slug: "Not A Handle" }));
    expect(result.ok).toBe(false);
  });

  it("saves template, accent, font and appearance together", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    const result = await updateAppearanceAction(undefined, form({ template: "atlas", accent: "#E0A458", fontStyle: "serif", appearance: "light" }));
    expect(result.ok).toBe(true);
    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved).toMatchObject({ template: "atlas", accent: "#E0A458", fontStyle: "serif", appearance: "light" });
  });

  it("refuses an unknown template", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    const result = await updateAppearanceAction(undefined, form({ template: "generic", accent: "#E0A458", fontStyle: "serif", appearance: "light" }));
    expect(result.ok).toBe(false);
    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    expect(saved!.template).toBe("signal");
  });
});

describe("section visibility", () => {
  it("stores hidden sections server-side and restores missing ones", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    const hidden = DEFAULT_SECTIONS.find((section) => section.id === "about")!;
    const payload = form({ redirectTo: "/dashboard/appearance" });
    for (const section of DEFAULT_SECTIONS) {
      if (section.id !== hidden.id) payload.append(`visible_${section.id}`, "on");
    }

    await expectRedirect(saveSectionsAction(payload), "/dashboard/appearance");

    const saved = await db.portfolio.findUnique({ where: { id: portfolio.id } });
    const sections = sectionsOrDefault(saved!.sections);
    expect(sections.find((section) => section.id === hidden.id)?.visible).toBe(false);
    expect(sections.filter((section) => section.visible).length).toBe(DEFAULT_SECTIONS.length - 1);
  });
});

describe("skills", () => {
  it("creates a skill group on demand and is idempotent for duplicates", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    await expectRedirect(saveSkillAction(form({ name: "TypeScript", group: "Languages", redirectTo: "/dashboard/content" })), "/dashboard/content");
    await expectRedirect(saveSkillAction(form({ name: "TypeScript", group: "Languages", redirectTo: "/dashboard/content" })), "/dashboard/content");

    const groups = await db.skillGroup.findMany({ where: { portfolioId: portfolio.id } });
    expect(groups).toHaveLength(1);
    expect(await db.skill.count({ where: { portfolioId: portfolio.id } })).toBe(1);
  });
});

describe("project management", () => {
  it("creates a project from the dashboard form", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);

    await expectRedirect(
      saveProject({ name: "BADO", status: "in-development", progress: "35", category: "geoscience" }),
      "/dashboard/projects?saved=1",
    );

    const project = await db.project.findFirst({ where: { portfolioId: portfolio.id } });
    expect(project).toMatchObject({ name: "BADO", status: "in-development", progress: 35, source: "manual", published: true });
    expect(project!.slug).toBe("bado");
  });

  it("de-duplicates project slugs inside one portfolio", async () => {
    const { user } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    await expectRedirect(saveProject({ name: "BADO" }), "/dashboard/projects?saved=1");
    await expectRedirect(saveProject({ name: "BADO" }), "/dashboard/projects?saved=1");

    const slugs = (await db.project.findMany({})).map((project) => project.slug).sort();
    expect(slugs).toEqual(["bado", "bado-2"]);
  });

  it("rejects a project with an unknown status", async () => {
    const { user } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    const result = await saveProjectForm(form({ name: "Mystery", category: "geoscience", status: "done" }));
    expect(result.ok).toBe(false);
    expect(await db.project.count()).toBe(0);
  });

  it("never edits another account's project by guessing its id", async () => {
    const alice = await createAccount({ email: "alice@example.com" });
    const bob = await createAccount({ email: "bob@example.com" });
    const aliceProject = await createProject(alice.portfolio.id, { name: "Alice only" });
    await signInAs(bob.user.id);

    const result = await saveProjectForm(form({ id: aliceProject.id, name: "Hijacked", category: "ai-llm", status: "live" }));
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Project not found.");
    const unchanged = await db.project.findUnique({ where: { id: aliceProject.id } });
    expect(unchanged!.name).toBe("Alice only");
  });

  it("toggles published and featured flags", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    const project = await createProject(portfolio.id, { published: true, featured: false });

    await expectRedirect(toggleProjectFlagAction(form({ id: project.id, field: "featured" })), "/dashboard/projects");
    await expectRedirect(toggleProjectFlagAction(form({ id: project.id, field: "published" })), "/dashboard/projects");
    await expectRedirect(toggleProjectFlagAction(form({ id: project.id, field: "role" })), "/dashboard/projects");

    const saved = await db.project.findUnique({ where: { id: project.id } });
    expect(saved!.featured).toBe(true);
    expect(saved!.published).toBe(false);
  });

  it("curates status and clamps progress from the GitHub console", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    const project = await createProject(portfolio.id, { status: "experimental" });

    await expectRedirect(
      setProjectStateAction(form({ id: project.id, status: "in-development", progress: "250" })),
      "/dashboard/github",
    );

    const saved = await db.project.findUnique({ where: { id: project.id } });
    expect(saved!.status).toBe("in-development");
    expect(saved!.progress).toBe(100);
  });

  it("deletes a project and its gallery images", async () => {
    const { user, portfolio } = await createAccount({ email: "maker@example.com" });
    await signInAs(user.id);
    const project = await createProject(portfolio.id);
    await db.projectImage.create({ data: { projectId: project.id, url: "/projects/a.png", alt: "Screenshot", sortOrder: 0 } });

    await expectRedirect(deleteProjectAction(form({ id: project.id })), "/dashboard/projects");
    expect(await db.project.count()).toBe(0);
    expect(await db.projectImage.count()).toBe(0);
  });
});

/* `saveProjectAction` is declared after the helpers above; importing it lazily
   keeps the test file readable while still exercising the real action. */
async function saveProject(values: Record<string, string | undefined>) {
  return saveProjectForm(
    form({
      category: "ai-llm",
      status: "in-development",
      tagline: "",
      description: "",
      progress: "",
      repoUrl: "",
      demoUrl: "",
      imageUrl: "",
      stack: "",
      features: "",
      problem: "",
      contribution: "",
      architecture: "",
      published: "on",
      ...values,
    }),
  );
}

async function saveProjectForm(payload: FormData) {
  const { saveProjectAction } = await import("@/app/actions/portfolio");
  return saveProjectAction(undefined, payload);
}
