/**
 * Seed the Folio database.
 *
 * Idempotent: re-running replaces the owner's portfolio content but keeps
 * other accounts. Content is sourced from src/content/personal.ts and
 * src/content/projects.ts — real repositories, real descriptions, no invented
 * employment, awards or metrics.
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { db } from "../lib/db";
import { hashPassword } from "../lib/crypto";
import { DEFAULT_SECTIONS } from "../lib/domain";
import { ACHIEVEMENTS, EXPERIENCE, OWNER, SKILL_GROUPS, TIMELINE } from "../content/personal";
import { PROJECTS } from "../content/projects";

async function main() {
  const email = (process.env.SEED_OWNER_EMAIL ?? "owner@folio.local").toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD ?? "change-me-please";
  const name = process.env.SEED_OWNER_NAME ?? OWNER.name;
  const slug = process.env.SEED_OWNER_SLUG ?? "israel-kolawole";

  if (password === "change-me-please") {
    console.warn("\n⚠  Using the default seed password. Set SEED_OWNER_PASSWORD before deploying.\n");
  }

  await db.$ensureSchema();
  const passwordHash = await hashPassword(password);

  const existing = await db.user.findFirst({ where: { email } });
  const owner = (existing
    ? await db.user.update({ where: { id: existing.id }, data: { name, role: "OWNER", passwordHash } })
    : await db.user.create({ data: { email, name, role: "OWNER", passwordHash } }))!;

  const profileData = {
    fullName: OWNER.name,
    title: OWNER.title,
    tagline: OWNER.tagline,
    story: OWNER.story.join("\n\n"),
    location: OWNER.location,
    email: OWNER.email,
    githubUrl: OWNER.github,
    linkedin: OWNER.linkedin,
    twitter: "",
    avatarUrl: null,
  };

  const existingProfile = await db.ownerProfile.findFirst({ where: { id: "owner" } });
  if (existingProfile) {
    await db.ownerProfile.update({ where: { id: "owner" }, data: profileData });
  } else {
    await db.ownerProfile.create({ data: { id: "owner", ...profileData } });
  }

  await db.timelineEntry.deleteMany({});
  await db.timelineEntry.createMany({
    data: TIMELINE.map((entry) => ({
      year: entry.year,
      title: entry.title,
      detail: entry.detail,
      kind: entry.kind,
      verified: true,
      sortOrder: entry.sortOrder,
    })),
  });

  const portfolioData = {
    userId: owner.id,
    title: `${OWNER.name} — ${OWNER.shortTitle}`,
    headline: "AI engineer building applications where geoscience, LLMs and real operational data meet.",
    bio: OWNER.story.slice(0, 2).join("\n\n"),
    location: OWNER.location,
    email: OWNER.email,
    availability: OWNER.availability,
    template: "atlas",
    accent: "#E0A458",
    fontStyle: "sans",
    appearance: "dark",
    published: true,
    publishedAt: new Date(),
    sections: JSON.stringify(DEFAULT_SECTIONS),
  };

  const existingPortfolio = await db.portfolio.findFirst({ where: { slug } });
  const portfolio = (existingPortfolio
    ? await db.portfolio.update({ where: { id: existingPortfolio.id }, data: portfolioData })
    : await db.portfolio.create({ data: { ...portfolioData, slug } }))!;

  await Promise.all([
    db.project.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.skill.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.skillGroup.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.experience.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.education.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.certification.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.achievement.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.socialLink.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.activityLog.deleteMany({ where: { portfolioId: portfolio.id } }),
    db.contactMessage.deleteMany({ where: { portfolioId: portfolio.id } }),
  ]);

  await db.socialLink.createMany({
    data: [
      { portfolioId: portfolio.id, label: "GitHub", url: OWNER.github, sortOrder: 0 },
      { portfolioId: portfolio.id, label: "Email", url: `mailto:${OWNER.email}`, sortOrder: 1 },
    ],
  });

  for (const [groupIndex, group] of SKILL_GROUPS.entries()) {
    const created = await db.skillGroup.create({
      data: { portfolioId: portfolio.id, name: group.name, sortOrder: groupIndex },
    });
    await db.skill.createMany({
      data: group.skills.map((skill, index) => ({
        portfolioId: portfolio.id,
        groupId: created.id,
        name: skill.name,
        learning: skill.learning,
        sortOrder: index,
      })),
    });
  }

  await db.experience.createMany({
    data: EXPERIENCE.map((entry, index) => ({
      portfolioId: portfolio.id,
      role: entry.role,
      organization: entry.organization,
      startDate: entry.startDate,
      endDate: entry.endDate,
      current: entry.current,
      location: entry.location,
      summary: entry.summary,
      highlights: JSON.stringify(entry.highlights),
      tech: JSON.stringify(entry.tech),
      sortOrder: index,
    })),
  });

  await db.achievement.createMany({
    data: ACHIEVEMENTS.map((entry, index) => ({
      portfolioId: portfolio.id,
      title: entry.title,
      detail: entry.detail,
      year: entry.year,
      kind: entry.kind,
      sortOrder: index,
    })),
  });

  for (const project of PROJECTS) {
    const created = await db.project.create({
      data: {
        portfolioId: portfolio.id,
        slug: project.slug,
        name: project.name,
        tagline: project.tagline,
        description: project.description,
        category: project.category,
        status: project.status,
        progress: project.progress ?? null,
        repoUrl: project.repoUrl,
        repoName: project.repoName,
        demoUrl: project.demoUrl ?? null,
        imageUrl: project.imageUrl ?? null,
        stack: JSON.stringify(project.stack),
        features: JSON.stringify(project.features),
        problem: project.problem,
        contribution: project.contribution,
        architecture: project.architecture,
        featured: project.featured,
        published: project.published,
        source: "github",
        language: project.language,
        stars: project.stars,
        forks: project.forks,
        lastPushedAt: new Date(project.lastPushedAt),
        sortOrder: project.sortOrder,
      },
    });

    if (project.gallery?.length) {
      await db.projectImage.createMany({
        data: project.gallery.map((image, index) => ({
          projectId: created.id,
          url: image.url,
          alt: image.alt,
          sortOrder: index,
        })),
      });
    }
  }

  const existingIntegration = await db.gitHubIntegration.findFirst({ where: { portfolioId: portfolio.id } });
  if (existingIntegration) {
    await db.gitHubIntegration.update({ where: { id: existingIntegration.id }, data: { username: OWNER.githubUsername } });
  } else {
    await db.gitHubIntegration.create({ data: { portfolioId: portfolio.id, username: OWNER.githubUsername } });
  }

  await db.activityLog.create({
    data: { portfolioId: portfolio.id, action: "seed", detail: "Portfolio seeded from verified GitHub content" },
  });

  const [projectCount, skillCount] = await Promise.all([
    db.project.count({ where: { portfolioId: portfolio.id } }),
    db.skill.count({ where: { portfolioId: portfolio.id } }),
  ]);

  console.log(`✓ Owner account: ${email}`);
  console.log(`✓ Portfolio: /u/${portfolio.slug}`);
  console.log(`✓ ${projectCount} projects, ${skillCount} skills, ${TIMELINE.length} timeline entries`);
  console.log("✓ Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    // PGlite flushes on process exit; give the WASM instance a tick to settle.
    await new Promise((resolve) => setTimeout(resolve, 100));
    process.exit(0);
  });
