import type { ProjectCategory, ProjectStatus } from "@/lib/domain";

/**
 * GitHub integration.
 *
 * The mapping layer is pure so it can be tested without network access; the
 * fetch layer adds caching, ETag revalidation and explicit rate-limit errors.
 * No token ever leaves the server — the browser only receives curated projects.
 */

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  private: boolean;
  pushed_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  default_branch: string;
  owner: { login: string };
}

export interface MappedProject {
  githubRepoId: string;
  repoName: string;
  name: string;
  slug: string;
  tagline: string;
  repoUrl: string;
  demoUrl: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastPushedAt: Date | null;
  status: ProjectStatus;
  category: ProjectCategory;
  stack: string[];
  readmeNote: string | null;
}

const STOP_NAMES = new Set(["dev-portfolio", "portfolio", "test", "dotfiles", "config"]);

const CATEGORY_RULES: { category: ProjectCategory; patterns: RegExp[] }[] = [
  {
    category: "geoscience",
    patterns: [/geo/i, /petro/i, /geolog/i, /subsurface/i, /reservoir/i, /groundwater/i, /seismic/i, /gis/i, /mining/i],
  },
  {
    category: "ai-llm",
    patterns: [/llm/i, /ai[-_ ]/i, /gpt/i, /gemini/i, /rag\b/i, /chatbot/i, /copilot/i, /agent/i, /predict/i, /machine[-_ ]?learning/i],
  },
  {
    category: "data-science",
    patterns: [/data/i, /analytic/i, /dataset/i, /visuali[sz]/i, /dashboard/i],
  },
  {
    category: "developer-tools",
    patterns: [/cli\b/i, /sdk/i, /api/i, /engineer/i, /boilerplate/i, /template/i, /toolkit/i],
  },
  {
    category: "automation",
    patterns: [/automat/i, /scrap/i, /bot\b/i, /pipeline/i, /workflow/i],
  },
];

export function inferCategory(repo: Pick<GitHubRepo, "name" | "description" | "topics" | "language">): ProjectCategory {
  const haystack = [repo.name, repo.description ?? "", (repo.topics ?? []).join(" ")].join(" ");
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) return rule.category;
  }
  if (repo.language === "TypeScript" || repo.language === "JavaScript" || repo.language === "HTML") {
    return "web-applications";
  }
  if (repo.language === "Python") return "ai-llm";
  return "experimental";
}

/** Only accept http(s) URLs — protects against javascript: or data: payloads. */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Infer a status without over-claiming:
 * archived wins, a reachable deployment means live, otherwise the repository is
 * treated as in development until the owner curates it. A repo never becomes
 * "completed" automatically.
 */
export function inferStatus(repo: Pick<GitHubRepo, "archived" | "homepage" | "pushed_at">): ProjectStatus {
  if (repo.archived) return "archived";
  if (safeExternalUrl(repo.homepage)) return "live";
  return "in-development";
}

export function repoToSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Second line of defence: never import an excluded shell repo by accident. */
export function isImportable(repo: Pick<GitHubRepo, "private" | "name">): boolean {
  if (repo.private) return false;
  if (STOP_NAMES.has(repo.name.toLowerCase())) return false;
  return true;
}

export function mapRepo(repo: GitHubRepo, languages: Record<string, number> = {}): MappedProject {
  const stack = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([language]) => language);
  if (!stack.length && repo.language) stack.push(repo.language);

  const demoUrl = safeExternalUrl(repo.homepage);
  const tagline = (repo.description ?? "").trim();

  return {
    githubRepoId: String(repo.id),
    repoName: repo.name,
    name: repo.name,
    slug: repoToSlug(repo.name),
    tagline,
    repoUrl: repo.html_url,
    demoUrl,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    lastPushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
    status: inferStatus(repo),
    category: inferCategory(repo),
    stack,
    readmeNote: null,
  };
}

/** Strip badges, HTML and headings, then return the first real paragraph. */
export function readmeExcerpt(markdown: string, max = 320): string | null {
  const cleaned = markdown
    .replace(/\r/g, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\b(https?:\/\/\S+)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[-=]{3,}$/gm, " ")
    .replace(/^\s*\|.*\|\s*$/gm, " ");

  const paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => !line.trim().startsWith("#"))
        .join(" ")
        .replace(/^[>\-*+]\s+/gm, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(
      (text) =>
        text.length > 60 &&
        !/^\[?!\[/.test(text) &&
        !/^(badge|build|coverage|license|version)\b/i.test(text),
    );

  const best = paragraphs[0];
  if (!best) return null;
  return best.length > max ? `${best.slice(0, max - 1).trimEnd()}…` : best;
}

export interface GitHubRate {
  remaining: number | null;
  reset: Date | null;
}

export class GitHubRateLimitError extends Error {
  resetAt: Date | null;
  constructor(resetAt: Date | null) {
    super("GitHub API rate limit reached");
    this.name = "GitHubRateLimitError";
    this.resetAt = resetAt;
  }
}

export class GitHubRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
  }
}

function readRate(headers: Headers): GitHubRate {
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  return {
    remaining: remaining === null ? null : Number(remaining),
    reset: reset === null ? null : new Date(Number(reset) * 1000),
  };
}

const API = "https://api.github.com";

async function githubFetch(path: string, token?: string, init: RequestInit & { etag?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set("User-Agent", "folio-portfolio-platform");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.etag) headers.set("If-None-Match", init.etag);

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  const rate = readRate(response.headers);
  if (response.status === 403 || response.status === 429) {
    if (rate.remaining === 0 || rate.reset) throw new GitHubRateLimitError(rate.reset);
  }
  if (response.status === 404) throw new GitHubRequestError("GitHub user or repository not found", 404);
  if (!response.ok && response.status !== 304) {
    throw new GitHubRequestError(`GitHub request failed (${response.status})`, response.status);
  }

  return { response, rate };
}

export interface FetchReposResult {
  repos: GitHubRepo[];
  rate: GitHubRate;
  etag: string | null;
  notModified: boolean;
}

export async function fetchUserRepos(
  username: string,
  options: { token?: string; etag?: string | null; page?: number } = {},
): Promise<FetchReposResult> {
  const cleanUsername = username.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9-]{1,39}$/.test(cleanUsername)) {
    throw new GitHubRequestError("Enter a valid GitHub username", 400);
  }

  const page = options.page ?? 1;
  const { response, rate } = await githubFetch(
    `/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&page=${page}&sort=pushed&type=owner`,
    options.token,
    { etag: options.etag ?? undefined },
  );

  if (response.status === 304) {
    return { repos: [], rate, etag: options.etag ?? null, notModified: true };
  }

  const payload = (await response.json()) as GitHubRepo[];
  const repos = Array.isArray(payload) ? payload : [];
  return { repos, rate, etag: response.headers.get("etag"), notModified: false };
}

export async function fetchRepoLanguages(
  fullName: string,
  token?: string,
): Promise<Record<string, number>> {
  try {
    const { response } = await githubFetch(`/repos/${fullName}/languages`, token);
    const payload = (await response.json()) as Record<string, number>;
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    // Language data is cosmetic; never fail a sync because of it.
    return {};
  }
}

export async function fetchRepoReadme(fullName: string, token?: string): Promise<string | null> {
  try {
    const { response } = await githubFetch(`/repos/${fullName}/readme`, token, {
      headers: { Accept: "application/vnd.github.raw+json" },
    });
    const text = await response.text();
    return text.slice(0, 20_000);
  } catch {
    return null;
  }
}

/** Accept the many shapes people paste into a "GitHub username" field. */
export function normaliseGithubUsername(input: string): string | null {
  const value = input.trim().replace(/^@/, "");
  if (!value) return null;
  const urlMatch = value.match(/github\.com\/([A-Za-z0-9-]{1,39})/i);
  const candidate = urlMatch ? urlMatch[1] : value;
  // GitHub handles are case-insensitive; store one canonical form so a user
  // cannot connect the same account twice by changing capitalisation.
  return /^[A-Za-z0-9-]{1,39}$/.test(candidate) ? candidate.toLowerCase() : null;
}
