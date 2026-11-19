"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canAdminister, canManagePortfolio } from "@/lib/permissions";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import {
  achievementSchema,
  appearanceSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  portfolioSlugSchema,
  signUpSchema,
  skillSchema,
  socialLinkSchema,
} from "@/lib/validation";
import { DEFAULT_SECTIONS, sectionsOrDefault } from "@/lib/domain";
import { parseSections, stringifyList } from "@/lib/json";
import { safeRedirectPath, slugify } from "@/lib/utils";
import { hashPassword, verifyPassword } from "@/lib/crypto";

/* ── Shared helpers ─────────────────────────────────────────── */

async function currentActor() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  return user;
}

/** Resolve the portfolio a signed-in user is allowed to mutate. */
async function authorizedPortfolio(portfolioId?: string) {
  const user = await currentActor();
  const portfolio = portfolioId
    ? await db.portfolio.findUnique({ where: { id: portfolioId } })
    : await db.portfolio.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

  if (!portfolio) redirect("/dashboard");
  if (!canManagePortfolio(user, portfolio)) {
    // Owners may edit any portfolio; a regular user only their own.
    redirect("/dashboard?denied=portfolio");
  }
  return { user, portfolio };
}

function revalidatePortfolio(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath(`/u/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function listField(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function backTo(formData: FormData, fallback: string): never {
  redirect(safeRedirectPath(formData.get("redirectTo"), fallback));
}

async function log(portfolioId: string, action: string, detail: string) {
  await db.activityLog.create({ data: { portfolioId, action, detail } });
}

/* ── Profile & presentation ─────────────────────────────────── */

export async function updateProfileAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);

  const parsed = profileSchema.safeParse({
    title: str(formData, "title"),
    headline: str(formData, "headline"),
    bio: str(formData, "bio"),
    location: str(formData, "location"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    availability: str(formData, "availability"),
    avatarUrl: str(formData, "avatarUrl"),
    coverUrl: str(formData, "coverUrl"),
  });

  if (!parsed.success) {
    return actionError("Check the highlighted fields.", Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
    ));
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
      coverUrl: parsed.data.coverUrl || null,
    },
  });

  await log(portfolio.id, "profile.updated", "Profile details updated");
  revalidatePortfolio(portfolio.slug);
  return actionOk("Profile saved.");
}

export async function updateAppearanceAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);

  const parsed = appearanceSchema.safeParse({
    template: str(formData, "template"),
    accent: str(formData, "accent"),
    fontStyle: str(formData, "fontStyle"),
    appearance: str(formData, "appearance"),
  });

  if (!parsed.success) {
    return actionError("Choose a valid template, colour and font.", Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
    ));
  }

  await db.portfolio.update({ where: { id: portfolio.id }, data: parsed.data });
  await log(portfolio.id, "appearance.updated", `Template set to ${parsed.data.template}`);
  revalidatePortfolio(portfolio.slug);
  return actionOk("Appearance saved.");
}

export async function updateSlugAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const { portfolio, user } = await authorizedPortfolio();
  const parsed = portfolioSlugSchema.safeParse(str(formData, "slug"));
  if (!parsed.success) {
    return actionError("That handle is not valid.", { slug: parsed.error.issues[0]?.message ?? "Invalid handle" });
  }

  const slug = parsed.data;
  if (slug === portfolio.slug) return actionOk("Handle unchanged.");

  const existing = await db.portfolio.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return actionError("That handle is already taken.", { slug: "Already taken" });

  await db.portfolio.update({ where: { id: portfolio.id }, data: { slug } });
  await log(portfolio.id, "slug.updated", `Public handle changed to ${slug}`);
  revalidatePath("/dashboard");
  revalidatePath(`/u/${portfolio.slug}`);
  revalidatePath(`/u/${slug}`);
  void user;
  return actionOk("Public URL updated.");
}

export async function setPublishedAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const publish = str(formData, "published") === "true";

  await db.portfolio.update({
    where: { id: portfolio.id },
    data: { published: publish, publishedAt: publish ? portfolio.publishedAt ?? new Date() : portfolio.publishedAt },
  });
  await log(portfolio.id, publish ? "portfolio.published" : "portfolio.unpublished", publish ? "Portfolio published" : "Portfolio unpublished");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard");
}

export async function saveSectionsAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const sections = sectionsOrDefault(portfolio.sections).map((section) => ({
    ...section,
    visible: str(formData, `visible_${section.id}`) === "on",
  }));
  await db.portfolio.update({ where: { id: portfolio.id }, data: { sections: JSON.stringify(sections) } });
  await log(portfolio.id, "sections.updated", "Public section visibility updated");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/appearance");
}

/* ── Experience, education, skills, achievements ────────────── */

export async function saveExperienceAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");

  const parsed = experienceSchema.safeParse({
    role: str(formData, "role"),
    organization: str(formData, "organization"),
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
    current: str(formData, "current") === "on",
    location: str(formData, "location"),
    summary: str(formData, "summary"),
    highlights: str(formData, "highlights"),
    tech: str(formData, "tech"),
  });
  if (!parsed.success) backTo(formData, "/dashboard/content?error=experience");

  const data = {
    role: parsed.data.role,
    organization: parsed.data.organization,
    startDate: parsed.data.startDate,
    endDate: parsed.data.current ? null : parsed.data.endDate || null,
    current: parsed.data.current,
    location: parsed.data.location || null,
    summary: parsed.data.summary,
    highlights: stringifyList(listField(formData, "highlights")),
    tech: stringifyList(listField(formData, "tech")),
  };

  if (id) {
    const existing = await db.experience.findFirst({ where: { id, portfolioId: portfolio.id } });
    if (!existing) redirect("/dashboard/content?denied=1");
    await db.experience.update({ where: { id }, data });
  } else {
    const count = await db.experience.count({ where: { portfolioId: portfolio.id } });
    await db.experience.create({ data: { ...data, portfolioId: portfolio.id, sortOrder: count } });
  }

  await log(portfolio.id, "experience.saved", parsed.data.role);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function deleteExperienceAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  await db.experience.deleteMany({ where: { id, portfolioId: portfolio.id } });
  await log(portfolio.id, "experience.deleted", "Experience entry removed");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function saveEducationAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  const parsed = educationSchema.safeParse({
    degree: str(formData, "degree"),
    institution: str(formData, "institution"),
    year: str(formData, "year"),
    location: str(formData, "location"),
    detail: str(formData, "detail"),
  });
  if (!parsed.success) backTo(formData, "/dashboard/content?error=education");

  const data = {
    degree: parsed.data.degree,
    institution: parsed.data.institution,
    year: parsed.data.year || null,
    location: parsed.data.location || null,
    detail: parsed.data.detail,
  };

  if (id) {
    const existing = await db.education.findFirst({ where: { id, portfolioId: portfolio.id } });
    if (!existing) redirect("/dashboard/content?denied=1");
    await db.education.update({ where: { id }, data });
  } else {
    const count = await db.education.count({ where: { portfolioId: portfolio.id } });
    await db.education.create({ data: { ...data, portfolioId: portfolio.id, sortOrder: count } });
  }

  await log(portfolio.id, "education.saved", parsed.data.degree);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function deleteEducationAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  await db.education.deleteMany({ where: { id: str(formData, "id"), portfolioId: portfolio.id } });
  await log(portfolio.id, "education.deleted", "Education entry removed");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function saveSkillAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const parsed = skillSchema.safeParse({
    name: str(formData, "name"),
    group: str(formData, "group") || "Core",
    learning: str(formData, "learning") === "on",
  });
  if (!parsed.success) backTo(formData, "/dashboard/content?error=skill");

  const groupName = parsed.data.group.trim() || "Core";
  let group = await db.skillGroup.findFirst({ where: { portfolioId: portfolio.id, name: groupName } });
  if (!group) {
    const count = await db.skillGroup.count({ where: { portfolioId: portfolio.id } });
    group = await db.skillGroup.create({ data: { portfolioId: portfolio.id, name: groupName, sortOrder: count } });
  }

  // Skills are curated, not scraped: adding the same name twice is a no-op so
  // the public page never shows duplicates.
  const existing = await db.skill.findMany({ where: { portfolioId: portfolio.id } });
  const duplicate = existing.find((skill) => skill.name.trim().toLowerCase() === parsed.data.name.trim().toLowerCase());

  if (duplicate) {
    await db.skill.update({ where: { id: duplicate.id }, data: { groupId: group.id, learning: parsed.data.learning } });
  } else {
    await db.skill.create({
      data: {
        portfolioId: portfolio.id,
        groupId: group.id,
        name: parsed.data.name,
        learning: parsed.data.learning,
        sortOrder: existing.length,
      },
    });
  }

  await log(portfolio.id, duplicate ? "skill.updated" : "skill.added", parsed.data.name);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function deleteSkillAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  await db.skill.deleteMany({ where: { id: str(formData, "id"), portfolioId: portfolio.id } });
  await log(portfolio.id, "skill.removed", "Skill removed");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function saveAchievementAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const parsed = achievementSchema.safeParse({
    title: str(formData, "title"),
    detail: str(formData, "detail"),
    year: str(formData, "year"),
    kind: str(formData, "kind") || "award",
  });
  if (!parsed.success) backTo(formData, "/dashboard/content?error=achievement");

  await db.achievement.create({
    data: {
      portfolioId: portfolio.id,
      title: parsed.data.title,
      detail: parsed.data.detail,
      year: parsed.data.year || null,
      kind: parsed.data.kind,
      sortOrder: await db.achievement.count({ where: { portfolioId: portfolio.id } }),
    },
  });
  await log(portfolio.id, "achievement.added", parsed.data.title);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function deleteAchievementAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  await db.achievement.deleteMany({ where: { id: str(formData, "id"), portfolioId: portfolio.id } });
  await log(portfolio.id, "achievement.removed", "Achievement removed");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function saveCertificationAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const parsed = certificationSchema.safeParse({
    title: str(formData, "title"),
    issuer: str(formData, "issuer"),
    year: str(formData, "year"),
    url: str(formData, "url"),
    learning: str(formData, "learning") === "on",
  });
  if (!parsed.success) backTo(formData, "/dashboard/content?error=certification");

  await db.certification.create({
    data: {
      portfolioId: portfolio.id,
      title: parsed.data.title,
      issuer: parsed.data.issuer,
      year: parsed.data.year || null,
      url: parsed.data.url || null,
      learning: parsed.data.learning,
      sortOrder: await db.certification.count({ where: { portfolioId: portfolio.id } }),
    },
  });
  await log(portfolio.id, "certification.added", parsed.data.title);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function deleteCertificationAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  await db.certification.deleteMany({ where: { id: str(formData, "id"), portfolioId: portfolio.id } });
  await log(portfolio.id, "certification.removed", "Certification removed");
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function saveSocialAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const parsed = socialLinkSchema.safeParse({ label: str(formData, "label"), url: str(formData, "url") });
  if (!parsed.success) backTo(formData, "/dashboard/content?error=social");

  await db.socialLink.create({
    data: {
      portfolioId: portfolio.id,
      label: parsed.data.label,
      url: parsed.data.url,
      sortOrder: await db.socialLink.count({ where: { portfolioId: portfolio.id } }),
    },
  });
  await log(portfolio.id, "social.added", parsed.data.label);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

export async function deleteSocialAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  await db.socialLink.deleteMany({ where: { id: str(formData, "id"), portfolioId: portfolio.id } });
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/content");
}

/* ── Projects ───────────────────────────────────────────────── */

export async function saveProjectAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");

  const parsed = projectSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    category: str(formData, "category"),
    status: str(formData, "status"),
    progress: str(formData, "progress") === "" ? null : str(formData, "progress"),
    repoUrl: str(formData, "repoUrl"),
    demoUrl: str(formData, "demoUrl"),
    imageUrl: str(formData, "imageUrl"),
    stack: str(formData, "stack"),
    features: str(formData, "features"),
    problem: str(formData, "problem"),
    contribution: str(formData, "contribution"),
    architecture: str(formData, "architecture"),
    featured: str(formData, "featured") === "on",
    published: str(formData, "published") === "on",
  });

  if (!parsed.success) {
    return actionError("Check the project details.", Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
    ));
  }

  const data = parsed.data;
  const baseSlug = data.slug || slugify(data.name) || "project";

  let slug = baseSlug;
  let attempt = 2;
  while (
    await db.project.findFirst({
      where: { portfolioId: portfolio.id, slug, NOT: id ? { id } : undefined },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${attempt}`;
    attempt += 1;
  }

  const values = {
    name: data.name,
    slug,
    tagline: data.tagline ?? "",
    description: data.description ?? "",
    category: data.category,
    status: data.status,
    progress: data.progress ?? null,
    repoUrl: data.repoUrl || null,
    demoUrl: data.demoUrl || null,
    imageUrl: data.imageUrl || null,
    stack: stringifyList(listField(formData, "stack")),
    features: stringifyList(listField(formData, "features")),
    problem: data.problem ?? "",
    contribution: data.contribution ?? "",
    architecture: data.architecture ?? "",
    featured: data.featured,
    published: data.published,
  };

  if (id) {
    const existing = await db.project.findFirst({ where: { id, portfolioId: portfolio.id } });
    if (!existing) return actionError("Project not found.");
    await db.project.update({ where: { id }, data: values });
    await log(portfolio.id, "project.updated", data.name);
  } else {
    await db.project.create({
      data: {
        ...values,
        portfolioId: portfolio.id,
        source: "manual",
        sortOrder: await db.project.count({ where: { portfolioId: portfolio.id } }),
      },
    });
    await log(portfolio.id, "project.created", data.name);
  }

  revalidatePortfolio(portfolio.slug);
  redirect("/dashboard/projects?saved=1");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  const project = await db.project.findFirst({ where: { id, portfolioId: portfolio.id } });
  if (project) {
    await db.project.delete({ where: { id } });
    await log(portfolio.id, "project.deleted", project.name);
  }
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/projects");
}

export async function toggleProjectFlagAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  const field = str(formData, "field");
  if (!["featured", "published", "excluded"].includes(field)) backTo(formData, "/dashboard/projects");

  const project = await db.project.findFirst({ where: { id, portfolioId: portfolio.id } });
  if (!project) backTo(formData, "/dashboard/projects");

  const current = field === "featured" ? project.featured : field === "published" ? project.published : project.excluded;
  await db.project.update({ where: { id }, data: { [field]: !current } });
  await log(portfolio.id, `project.${field}`, `${project.name} ${field} toggled`);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/projects");
}

/** Pin/unpin with an explicit target state, used by the GitHub console. */
export async function setProjectStateAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  const project = await db.project.findFirst({ where: { id, portfolioId: portfolio.id } });
  if (!project) backTo(formData, "/dashboard/projects");

  const status = str(formData, "status");
  const progressRaw = str(formData, "progress");
  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (progressRaw !== "") data.progress = Math.max(0, Math.min(100, Number(progressRaw)));
  if (str(formData, "exclude") === "true") data.excluded = true;
  if (str(formData, "include") === "true") data.excluded = false;

  await db.project.update({ where: { id }, data });
  await log(portfolio.id, "project.curated", `${project.name} updated by owner`);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/github");
}

/* ── Contact inbox ──────────────────────────────────────────── */

export async function markMessageReadAction(formData: FormData): Promise<void> {
  const user = await currentActor();
  const id = str(formData, "id");
  const message = await db.contactMessage.findUnique({ where: { id } });
  if (!message) redirect("/dashboard/inbox");
  if (message.userId !== user.id && !canAdminister(user)) redirect("/dashboard/inbox?denied=1");

  await db.contactMessage.update({ where: { id }, data: { read: str(formData, "read") !== "false" } });
  revalidatePath("/dashboard/inbox");
  revalidatePath("/admin");
  backTo(formData, "/dashboard/inbox");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const user = await currentActor();
  const id = str(formData, "id");
  const message = await db.contactMessage.findUnique({ where: { id } });
  if (!message) redirect("/dashboard/inbox");
  if (message.userId !== user.id && !canAdminister(user)) redirect("/dashboard/inbox?denied=1");

  await db.contactMessage.delete({ where: { id } });
  revalidatePath("/dashboard/inbox");
  backTo(formData, "/dashboard/inbox");
}

/* ── Account ────────────────────────────────────────────────── */

export async function updateAccountAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const user = await currentActor();
  const name = str(formData, "name").trim();
  const parsed = signUpSchema.pick({ name: true }).safeParse({ name });
  if (!parsed.success) return actionError("Enter your name.", { name: "Enter your name" });

  await db.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidatePath("/dashboard");
  return actionOk("Account updated.");
}

export async function changePasswordAction(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const user = await currentActor();
  const current = str(formData, "currentPassword");
  const next = str(formData, "newPassword");
  const confirm = str(formData, "confirmPassword");

  if (next !== confirm) return actionError("New passwords do not match.", { confirmPassword: "Does not match" });
  if (next.length < 10 || !/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) {
    return actionError("Use at least 10 characters including a letter and a number.", { newPassword: "Too weak" });
  }

  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record) return actionError("Account not found.");
  if (!(await verifyPassword(current, record.passwordHash))) {
    return actionError("Your current password is incorrect.", { currentPassword: "Incorrect password" });
  }

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  // Keep the current session, revoke the rest.
  return actionOk("Password changed.");
}

/** Add all default sections to a portfolio that predates a section addition. */
export async function restoreDefaultSectionsAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const existing = parseSections(portfolio.sections);
  const merged = sectionsOrDefault(JSON.stringify([...existing, ...DEFAULT_SECTIONS]));
  await db.portfolio.update({ where: { id: portfolio.id }, data: { sections: merged.length ? JSON.stringify(merged) : JSON.stringify(DEFAULT_SECTIONS) } });
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/appearance");
}

/* ── Account deletion ───────────────────────────────────────── */

/**
 * Permanently delete the signed-in account. Requires the exact account email to
 * be typed, verified server-side, and cascades through portfolios/projects.
 */
export async function deleteAccountAction(formData: FormData): Promise<void> {
  const user = await currentActor();
  const confirmation = str(formData, "confirmEmail").trim().toLowerCase();

  if (confirmation !== user.email.toLowerCase()) {
    redirect("/dashboard/settings?error=Type%20your%20email%20exactly%20to%20confirm");
  }

  await db.user.delete({ where: { id: user.id } });
  await db.session.deleteMany({ where: { userId: user.id } }).catch(() => undefined);
  redirect("/?deleted=1");
}

/* ── GitHub curation helpers ────────────────────────────────── */

/** Accept a README-derived suggestion as the project tagline. */
export async function acceptReadmeSuggestionAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  const project = await db.project.findFirst({ where: { id, portfolioId: portfolio.id } });
  if (!project) redirect("/dashboard/github");

  await db.project.update({
    where: { id },
    data: {
      tagline: project.readmeNote?.slice(0, 160) || project.tagline,
      description: project.description || project.readmeNote || "",
      readmeNote: null,
    },
  });
  await log(portfolio.id, "project.suggestion", `README suggestion accepted for ${project.name}`);
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/github");
}

/** Dismiss a suggestion without changing the project. */
export async function dismissReadmeSuggestionAction(formData: FormData): Promise<void> {
  const { portfolio } = await authorizedPortfolio(str(formData, "portfolioId") || undefined);
  const id = str(formData, "id");
  await db.project.updateMany({ where: { id, portfolioId: portfolio.id }, data: { readmeNote: null } });
  revalidatePortfolio(portfolio.slug);
  backTo(formData, "/dashboard/github");
}
