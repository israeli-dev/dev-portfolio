"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManagePortfolio } from "@/lib/permissions";
import { profileSchema, projectSchema, experienceSchema, educationSchema } from "@/lib/validation";
import { presetByProfession, TEMPLATES } from "@/lib/templates";
import { stringifyList } from "@/lib/json";
import { syncGithubForPortfolio } from "@/lib/github-sync";
import { normaliseGithubUsername } from "@/lib/github";
import { slugify } from "@/lib/utils";

/**
 * Wizard actions always redirect to the next step, so progress is URL-based
 * and survives refreshes. Optional steps accept empty input and simply skip.
 */

const BASE = "/dashboard/wizard";

function stepUrl(step: number, extra?: Record<string, string>) {
  const params = new URLSearchParams({ step: String(step), ...extra });
  return `${BASE}?${params.toString()}`;
}

async function wizardPortfolio() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/wizard");
  const portfolio = await db.portfolio.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  if (!portfolio) redirect("/dashboard");
  if (!canManagePortfolio(user, portfolio)) redirect("/dashboard?denied=portfolio");
  return { user, portfolio };
}

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function refresh(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath(BASE);
  revalidatePath("/dashboard/preview");
  revalidatePath(`/u/${slug}`);
}

export async function applyPresetAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const presetId = field(formData, "preset");
  const preset = presetByProfession(presetId);

  if (preset) {
    await db.portfolio.update({
      where: { id: portfolio.id },
      data: {
        template: preset.template,
        accent: preset.accent,
        appearance: preset.appearance,
        fontStyle: preset.font,
      },
    });
    await db.activityLog.create({
      data: { portfolioId: portfolio.id, action: "wizard.preset", detail: `Profession preset: ${preset.label}` },
    });
  }

  refresh(portfolio.slug);
  redirect(stepUrl(2, { saved: "Preset applied" }));
}

export async function chooseTemplateAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const templateId = field(formData, "template");
  const template = TEMPLATES.find((item) => item.id === templateId);
  if (template) {
    await db.portfolio.update({
      where: { id: portfolio.id },
      data: { template: template.id, accent: template.defaultAccent, appearance: template.defaultAppearance },
    });
  }
  refresh(portfolio.slug);
  redirect(stepUrl(3, { saved: "Template selected" }));
}

export async function wizardProfileAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const parsed = profileSchema.safeParse({
    title: field(formData, "title"),
    headline: field(formData, "headline"),
    bio: field(formData, "bio"),
    location: field(formData, "location"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    availability: field(formData, "availability"),
    avatarUrl: field(formData, "avatarUrl"),
    coverUrl: "",
  });

  if (!parsed.success) {
    redirect(stepUrl(3, { error: parsed.error.issues[0]?.message ?? "Check your profile details" }));
  }

  await db.portfolio.update({
    where: { id: portfolio.id },
    data: {
      title: parsed.data.title,
      headline: parsed.data.headline,
      bio: parsed.data.bio,
      location: parsed.data.location,
      email: parsed.data.email,
      phone: parsed.data.phone,
      availability: parsed.data.availability,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });
  refresh(portfolio.slug);
  redirect(stepUrl(4, { saved: "Profile saved" }));
}

export async function wizardExperienceAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  if (!field(formData, "role").trim()) redirect(stepUrl(5));

  const parsed = experienceSchema.safeParse({
    role: field(formData, "role"),
    organization: field(formData, "organization"),
    startDate: field(formData, "startDate"),
    endDate: field(formData, "endDate"),
    current: field(formData, "current") === "on",
    location: field(formData, "location"),
    summary: field(formData, "summary"),
    highlights: "",
    tech: field(formData, "tech"),
  });

  if (!parsed.success) redirect(stepUrl(4, { error: parsed.error.issues[0]?.message ?? "Check the experience details" }));

  await db.experience.create({
    data: {
      portfolioId: portfolio.id,
      role: parsed.data.role,
      organization: parsed.data.organization,
      startDate: parsed.data.startDate,
      endDate: parsed.data.current ? null : parsed.data.endDate || null,
      current: parsed.data.current,
      location: parsed.data.location || null,
      summary: parsed.data.summary,
      highlights: "[]",
      tech: stringifyList(field(formData, "tech").split(",")),
      sortOrder: await db.experience.count({ where: { portfolioId: portfolio.id } }),
    },
  });
  refresh(portfolio.slug);
  redirect(stepUrl(5, { saved: "Experience added" }));
}

export async function wizardEducationAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  if (!field(formData, "degree").trim()) redirect(stepUrl(6));

  const parsed = educationSchema.safeParse({
    degree: field(formData, "degree"),
    institution: field(formData, "institution"),
    year: field(formData, "year"),
    location: field(formData, "location"),
    detail: field(formData, "detail"),
  });
  if (!parsed.success) redirect(stepUrl(5, { error: parsed.error.issues[0]?.message ?? "Check the education details" }));

  await db.education.create({
    data: {
      portfolioId: portfolio.id,
      degree: parsed.data.degree,
      institution: parsed.data.institution,
      year: parsed.data.year || null,
      location: parsed.data.location || null,
      detail: parsed.data.detail,
      sortOrder: await db.education.count({ where: { portfolioId: portfolio.id } }),
    },
  });
  refresh(portfolio.slug);
  redirect(stepUrl(6, { saved: "Education added" }));
}

export async function wizardSkillsAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const raw = field(formData, "skills");
  const groupName = field(formData, "group").trim() || "Core";
  const names = raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 40);

  if (!names.length) redirect(stepUrl(7));

  let group = await db.skillGroup.findFirst({ where: { portfolioId: portfolio.id, name: groupName } });
  if (!group) {
    group = await db.skillGroup.create({
      data: { portfolioId: portfolio.id, name: groupName, sortOrder: await db.skillGroup.count({ where: { portfolioId: portfolio.id } }) },
    });
  }

  const start = await db.skill.count({ where: { portfolioId: portfolio.id } });
  await db.skill.createMany({
    data: names.map((name, index) => ({
      portfolioId: portfolio.id,
      groupId: group!.id,
      name,
      learning: false,
      sortOrder: start + index,
    })),
  });

  refresh(portfolio.slug);
  redirect(stepUrl(7, { saved: `${names.length} skills saved` }));
}

export async function wizardProjectAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  if (!field(formData, "name").trim()) redirect(stepUrl(8));

  const parsed = projectSchema.safeParse({
    name: field(formData, "name"),
    slug: "",
    tagline: field(formData, "tagline"),
    description: field(formData, "description"),
    category: field(formData, "category") || "web-applications",
    status: field(formData, "status") || "in-development",
    progress: null,
    repoUrl: field(formData, "repoUrl"),
    demoUrl: field(formData, "demoUrl"),
    imageUrl: "",
    stack: field(formData, "stack"),
    features: "",
    problem: "",
    contribution: "",
    architecture: "",
    featured: false,
    published: true,
  });

  if (!parsed.success) redirect(stepUrl(7, { error: parsed.error.issues[0]?.message ?? "Check the project details" }));

  let slug = slugify(parsed.data.name) || "project";
  let attempt = 2;
  while (await db.project.findFirst({ where: { portfolioId: portfolio.id, slug }, select: { id: true } })) {
    slug = `${slugify(parsed.data.name)}-${attempt}`;
    attempt += 1;
  }

  await db.project.create({
    data: {
      portfolioId: portfolio.id,
      slug,
      name: parsed.data.name,
      tagline: parsed.data.tagline ?? "",
      description: parsed.data.description ?? "",
      category: parsed.data.category,
      status: parsed.data.status,
      repoUrl: parsed.data.repoUrl || null,
      demoUrl: parsed.data.demoUrl || null,
      stack: stringifyList(field(formData, "stack").split(",")),
      source: "manual",
      published: true,
      sortOrder: await db.project.count({ where: { portfolioId: portfolio.id } }),
    },
  });

  refresh(portfolio.slug);
  redirect(stepUrl(8, { saved: "Project added" }));
}

export async function wizardGithubSyncAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const username = normaliseGithubUsername(field(formData, "username"));
  if (!username) redirect(stepUrl(7, { error: "Enter a valid GitHub username" }));

  try {
    const result = await syncGithubForPortfolio(portfolio.id, username);
    refresh(portfolio.slug);
    redirect(
      stepUrl(8, {
        saved: result.notModified
          ? "GitHub already up to date"
          : `${result.imported} repositories imported, ${result.updated} refreshed`,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub sync failed";
    redirect(stepUrl(7, { error: message }));
  }
}

export async function wizardAppearanceAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const accent = field(formData, "accent");
  const fontStyle = field(formData, "fontStyle");
  const appearance = field(formData, "appearance");
  const template = field(formData, "template");

  await db.portfolio.update({
    where: { id: portfolio.id },
    data: {
      accent: /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : portfolio.accent,
      fontStyle: ["sans", "serif", "mono"].includes(fontStyle) ? fontStyle : portfolio.fontStyle,
      appearance: ["dark", "light"].includes(appearance) ? appearance : portfolio.appearance,
      template: TEMPLATES.some((item) => item.id === template) ? template : portfolio.template,
    },
  });
  refresh(portfolio.slug);
  redirect(stepUrl(9, { saved: "Design saved" }));
}

export async function wizardPublishAction(formData: FormData): Promise<void> {
  const { portfolio } = await wizardPortfolio();
  const publish = field(formData, "published") !== "false";

  await db.portfolio.update({
    where: { id: portfolio.id },
    data: { published: publish, publishedAt: publish ? portfolio.publishedAt ?? new Date() : portfolio.publishedAt },
  });
  await db.activityLog.create({
    data: {
      portfolioId: portfolio.id,
      action: publish ? "portfolio.published" : "portfolio.unpublished",
      detail: publish ? "Published from the wizard" : "Unpublished from the wizard",
    },
  });
  refresh(portfolio.slug);
  redirect(stepUrl(10, { published: publish ? "true" : "false" }));
}
