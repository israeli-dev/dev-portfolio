import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { DEFAULT_SECTIONS } from "@/lib/domain";
import type { SectionConfig } from "@/lib/json";
import { clearRequestState } from "./request";
import { resetRateLimits } from "@/lib/rate-limit";

/** Delete every row, children first. Keeps each test independent. */
export async function resetDatabase(): Promise<void> {
  await db.activityLog.deleteMany({});
  await db.contactMessage.deleteMany({});
  await db.projectImage.deleteMany({});
  await db.project.deleteMany({});
  await db.skill.deleteMany({});
  await db.skillGroup.deleteMany({});
  await db.certification.deleteMany({});
  await db.achievement.deleteMany({});
  await db.education.deleteMany({});
  await db.experience.deleteMany({});
  await db.socialLink.deleteMany({});
  await db.gitHubIntegration.deleteMany({});
  await db.session.deleteMany({});
  await db.passwordResetToken.deleteMany({});
  await db.portfolio.deleteMany({});
  await db.timelineEntry.deleteMany({});
  await db.ownerProfile.deleteMany({});
  await db.user.deleteMany({});
}

export function resetRequest(): void {
  clearRequestState();
  resetRateLimits();
}

/**
 * Register a user *without* touching the sign-in flow, for authorization and
 * isolation tests. `signUpAction` is exercised separately.
 */
export async function createAccount(options: {
  email: string;
  name?: string;
  role?: "USER" | "OWNER";
  password?: string;
  published?: boolean;
  sections?: SectionConfig[];
}) {
  const password = options.password ?? "correct-horse-9";
  const name = options.name ?? "Test Person";
  const user = await db.user.create({
    data: {
      name,
      email: options.email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: options.role ?? "USER",
    },
  });

  const portfolio = await db.portfolio.create({
    data: {
      userId: user.id,
      slug: options.email.split("@")[0].replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
      title: name,
      headline: "",
      bio: "",
      sections: JSON.stringify(options.sections ?? DEFAULT_SECTIONS),
      published: options.published ?? false,
      publishedAt: options.published ? new Date() : null,
      template: "signal",
      accent: "#7DD3C0",
    },
  });

  return { user, portfolio, password };
}

/** Build a FormData payload, skipping undefined values. */
export function form(values: Record<string, string | undefined>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) data.append(key, value);
  }
  return data;
}

export async function createProject(portfolioId: string, overrides: Record<string, unknown> = {}) {
  const count = await db.project.count({ where: { portfolioId } });
  return db.project.create({
    data: {
      portfolioId,
      slug: `project-${count + 1}`,
      name: `Project ${count + 1}`,
      tagline: "A real project",
      category: "ai-llm",
      status: "in-development",
      stack: "[]",
      features: "[]",
      sortOrder: count,
      ...overrides,
    },
  });
}

export { db };
