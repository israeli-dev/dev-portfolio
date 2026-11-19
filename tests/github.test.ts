import { describe, expect, it } from "vitest";
import {
  inferCategory,
  inferStatus,
  isImportable,
  mapRepo,
  normaliseGithubUsername,
  readmeExcerpt,
  repoToSlug,
  safeExternalUrl,
  type GitHubRepo,
} from "@/lib/github";

function repo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 123456,
    name: "geoscience-doc-copilot",
    full_name: "israeli-dev/geoscience-doc-copilot",
    private: false,
    archived: false,
    fork: false,
    description: "Subsurface document intelligence",
    homepage: "https://example.streamlit.app",
    language: "Python",
    topics: ["geoscience", "llm"],
    stargazers_count: 0,
    forks_count: 0,
    pushed_at: "2026-11-19T10:00:00Z",
    updated_at: "2026-11-19T10:00:00Z",
    created_at: "2025-01-02T10:00:00Z",
    default_branch: "main",
    owner: { login: "israeli-dev" },
    html_url: "https://github.com/israeli-dev/geoscience-doc-copilot",
    ...overrides,
  };
}

describe("github: honest status inference", () => {
  it("never marks a freshly imported repository as completed", () => {
    expect(inferStatus(repo())).toBe("live");
    expect(inferStatus(repo({ homepage: null }))).toBe("in-development");
    expect(inferStatus(repo({ archived: true }))).toBe("archived");
  });

  it("only treats real http(s) homepages as deployed", () => {
    expect(safeExternalUrl("https://bado-seven.vercel.app")).toBe("https://bado-seven.vercel.app/");
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("")).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
    expect(inferStatus(repo({ homepage: "javascript:alert(1)" }))).toBe("in-development");
  });
});

describe("github: import filtering", () => {
  it("skips private repositories and known shell repositories", () => {
    expect(isImportable(repo())).toBe(true);
    expect(isImportable(repo({ private: true }))).toBe(false);
    expect(isImportable(repo({ name: "dev-portfolio" }))).toBe(false);
  });

  it("normalises handles and rejects anything that is not one", () => {
    expect(normaliseGithubUsername("  Israeli-Dev ")).toBe("israeli-dev");
    expect(normaliseGithubUsername("@Israeli-Dev")).toBe("israeli-dev");
    expect(normaliseGithubUsername("https://github.com/israeli-dev")).toBe("israeli-dev");
    expect(normaliseGithubUsername("not a handle!")).toBeNull();
    expect(normaliseGithubUsername("")).toBeNull();
  });
});

describe("github: mapping", () => {
  it("maps API fields into project fields with real technology data", () => {
    const mapped = mapRepo(repo(), { Python: 40000, Dockerfile: 1200, Makefile: 300, Shell: 100 });
    expect(mapped).toMatchObject({
      githubRepoId: "123456",
      repoName: "geoscience-doc-copilot",
      slug: "geoscience-doc-copilot",
      status: "live",
      language: "Python",
      repoUrl: "https://github.com/israeli-dev/geoscience-doc-copilot",
      demoUrl: "https://example.streamlit.app/",
    });
    expect(mapped.stack).toEqual(["Python", "Dockerfile", "Makefile", "Shell"]);
    expect(mapped.category).toBe("geoscience");
  });

  it("keeps at most four languages and falls back to the primary language", () => {
    const mapped = mapRepo(repo());
    expect(mapped.stack).toEqual(["Python"]);
  });

  it("categories from real metadata, not guesses about quality", () => {
    expect(inferCategory({ name: "geoscience-doc-copilot", description: "", topics: [], language: "Python" })).toBe("geoscience");
    expect(inferCategory({ name: "llm-product-engineer", description: "LLM notes", topics: [], language: "Python" })).toBe("ai-llm");
    expect(inferCategory({ name: "bado", description: "asset platform", topics: [], language: "TypeScript" })).toBe("web-applications");
  });

  it("builds URL-safe slugs", () => {
    expect(repoToSlug("Space_story")).toBe("space-story");
    expect(repoToSlug("  ")).toBe("");
  });

  it("extracts a usable README excerpt without badges or headings", () => {
    const excerpt = readmeExcerpt("# Title\n\n[![Build](badge)](link)\n\nThis project reads well reports and answers questions with citations.");
    expect(excerpt).toContain("This project reads well reports");
    expect(excerpt).not.toContain("badge");
    expect(readmeExcerpt("")).toBeNull();
  });
});
