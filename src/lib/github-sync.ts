import { db } from "@/lib/db";
import {
  fetchRepoLanguages,
  fetchRepoReadme,
  fetchUserRepos,
  GitHubRateLimitError,
  mapRepo,
  normaliseGithubUsername,
  isImportable,
  readmeExcerpt,
  type GitHubRepo,
} from "@/lib/github";

export interface SyncResult {
  imported: number;
  updated: number;
  skipped: number;
  suggestionCount: number;
  notModified: boolean;
  rateRemaining: number | null;
  rateReset: Date | null;
}

/** Case-insensitive repository URL key, tolerant of trailing slashes and .git. */
function normalizeRepoUrl(url: string): string {
  return url.trim().toLowerCase().replace(/\/$/, "").replace(/\.git$/, "");
}

const MAX_README_LOOKUPS = 5;

/**
 * Synchronise public repositories into a portfolio.
 *
 * Curation is never overwritten: GitHub-sourced fields (stars, forks, last
 * push, languages, repository URL) are refreshed, while owner-authored copy
 * (tagline, status, category, progress, demo URL) is only filled when empty or
 * when the project was just created.
 */
export async function syncGithubForPortfolio(
  portfolioId: string,
  rawUsername: string,
): Promise<SyncResult> {
  const username = normaliseGithubUsername(rawUsername);
  if (!username) throw new Error("Enter a valid GitHub username, e.g. israeli-dev");

  const token = process.env.GITHUB_TOKEN?.trim() || undefined;

  const integration = (await db.gitHubIntegration.upsert({
    where: { portfolioId },
    update: { username },
    create: { portfolioId, username },
  }))!;

  // Revalidate with ETag only when the last sync was recent, so "Sync now"
  // always returns fresh data but passive loads stay cheap.
  const recentlySynced =
    integration.lastSyncedAt !== null && Date.now() - integration.lastSyncedAt.getTime() < 5 * 60 * 1000;

  let repos: GitHubRepo[] = [];
  let etag = integration.etag;
  let notModified = false;
  let rateRemaining: number | null = null;
  let rateReset: Date | null = null;

  try {
    const page1 = await fetchUserRepos(username, {
      token,
      etag: recentlySynced ? integration.etag : null,
    });
    notModified = page1.notModified;
    etag = page1.etag ?? etag;
    rateRemaining = page1.rate.remaining;
    rateReset = page1.rate.reset;

    if (!notModified) {
      repos = page1.repos;
      // Politely page through additional repositories (max 3 pages = 300 repos).
      for (let page = 2; page <= 3 && page1.repos.length === 100; page += 1) {
        const next = await fetchUserRepos(username, { token, page });
        if (!next.repos.length) break;
        repos = repos.concat(next.repos);
      }
    }
  } catch (error) {
    const message =
      error instanceof GitHubRateLimitError
        ? "GitHub rate limit reached. Try again after the reset shown below, or add GITHUB_TOKEN."
        : error instanceof Error
          ? error.message
          : "GitHub sync failed";
    await db.gitHubIntegration.update({
      where: { portfolioId },
      data: { lastError: message, lastSyncedAt: new Date(), rateRemaining, rateReset },
    });
    throw error;
  }

  if (notModified) {
    await db.gitHubIntegration.update({
      where: { portfolioId },
      data: { lastError: null, lastSyncedAt: new Date(), rateRemaining, rateReset },
    });
    return {
      imported: 0,
      updated: 0,
      skipped: 0,
      suggestionCount: 0,
      notModified: true,
      rateRemaining,
      rateReset,
    };
  }

  const existing = await db.project.findMany({
    where: { portfolioId },
    select: {
      id: true,
      githubRepoId: true,
      repoUrl: true,
      slug: true,
      tagline: true,
      demoUrl: true,
      excluded: true,
    },
  });
  const byRepoId = new Map(existing.filter((project) => project.githubRepoId).map((project) => [project.githubRepoId!, project]));
  // Curated records created by the seed (or by hand) predate their GitHub id,
  // so the repository URL is the fallback key. Without this, every sync would
  // duplicate the owner's hand-written project entries.
  const byRepoUrl = new Map(
    existing.filter((project) => project.repoUrl).map((project) => [normalizeRepoUrl(project.repoUrl!), project]),
  );
  const usedSlugs = new Set(
    (await db.project.findMany({ where: { portfolioId }, select: { slug: true } })).map((p) => p.slug),
  );

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let suggestionCount = 0;

  const importable = repos.filter((repo) => {
    if (!isImportable(repo)) {
      skipped += 1;
      return false;
    }
    return true;
  });

  for (const repo of importable) {
    const languages = await fetchRepoLanguages(repo.full_name, token);
    const mapped = mapRepo(repo, languages);
    const current = byRepoId.get(mapped.githubRepoId) ?? byRepoUrl.get(normalizeRepoUrl(mapped.repoUrl));

    if (current?.excluded) {
      skipped += 1;
      continue;
    }

    let readmeNote: string | null = null;
    if (!mapped.tagline && suggestionCount < MAX_README_LOOKUPS) {
      const readme = await fetchRepoReadme(repo.full_name, token);
      if (readme) {
        readmeNote = readmeExcerpt(readme);
        if (readmeNote) suggestionCount += 1;
      }
    }

    if (current) {
      await db.project.update({
        where: { id: current.id },
        data: {
          // Adopt the numeric id so later syncs match even if the URL changes.
          githubRepoId: mapped.githubRepoId,
          repoUrl: mapped.repoUrl,
          repoName: mapped.repoName,
          language: mapped.language,
          stars: mapped.stars,
          forks: mapped.forks,
          lastPushedAt: mapped.lastPushedAt,
          stack: JSON.stringify(mapped.stack),
          tagline: current.tagline || mapped.tagline,
          demoUrl: current.demoUrl || mapped.demoUrl,
          ...(readmeNote ? { readmeNote } : {}),
        },
      });
      updated += 1;
      continue;
    }

    let slug = mapped.slug || "project";
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${mapped.slug}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    await db.project.create({
      data: {
        portfolioId,
        slug,
        name: mapped.name,
        tagline: mapped.tagline || readmeNote || "",
        description: "",
        category: mapped.category,
        status: mapped.status,
        progress: null,
        repoUrl: mapped.repoUrl,
        repoName: mapped.repoName,
        demoUrl: mapped.demoUrl,
        stack: JSON.stringify(mapped.stack),
        source: "github",
        githubRepoId: mapped.githubRepoId,
        language: mapped.language,
        stars: mapped.stars,
        forks: mapped.forks,
        lastPushedAt: mapped.lastPushedAt,
        readmeNote,
        published: true,
        featured: false,
      },
    });
    imported += 1;
  }

  await db.gitHubIntegration.update({
    where: { portfolioId },
    data: {
      lastSyncedAt: new Date(),
      etag,
      lastError: null,
      rateRemaining,
      rateReset,
    },
  });

  await db.activityLog.create({
    data: {
      portfolioId,
      action: "github.sync",
      detail: `${imported} imported · ${updated} refreshed · ${skipped} skipped`,
    },
  });

  return { imported, updated, skipped, suggestionCount, notModified, rateRemaining, rateReset };
}
