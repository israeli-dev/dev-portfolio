import { describe, expect, it } from "vitest";
import {
  appearanceSchema,
  contactSchema,
  emailSchema,
  passwordSchema,
  portfolioSlugSchema,
  profileSchema,
  projectSchema,
  signUpSchema,
} from "@/lib/validation";
import { completeness, sectionsOrDefault, DEFAULT_SECTIONS, isWorkInProgress } from "@/lib/domain";
import { safeRedirectPath, slugify, formatDate } from "@/lib/utils";
import { assignableRole, canManagePortfolio, canAdminister, canReadPublishedPortfolio, visibleSections } from "@/lib/permissions";

describe("validation: accounts", () => {
  it("normalises email casing and whitespace", () => {
    expect(emailSchema.parse("  Israel@Example.COM ")).toBe("israel@example.com");
  });

  it("rejects malformed emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("").success).toBe(false);
  });

  it("requires a 10+ character password with a letter and a number", () => {
    expect(passwordSchema.safeParse("short1").success).toBe(false);
    expect(passwordSchema.safeParse("allletterslong").success).toBe(false);
    expect(passwordSchema.safeParse("12345678901").success).toBe(false);
    expect(passwordSchema.safeParse("folio-owner-2026").success).toBe(true);
  });

  it("rejects a sign-up with a missing name", () => {
    const result = signUpSchema.safeParse({ name: " ", email: "a@b.co", password: "correct-horse-9" });
    expect(result.success).toBe(false);
  });
});

describe("validation: profile and appearance", () => {
  it("fills optional profile fields with empty strings", () => {
    const parsed = profileSchema.parse({ title: "AI Engineer" });
    expect(parsed).toMatchObject({ headline: "", bio: "", location: "", email: "" });
  });

  it("accepts an empty contact email but rejects a malformed one", () => {
    expect(profileSchema.safeParse({ title: "AI Engineer", email: "" }).success).toBe(true);
    expect(profileSchema.safeParse({ title: "AI Engineer", email: "nope" }).success).toBe(false);
  });

  it("only allows the four shipped templates", () => {
    expect(appearanceSchema.safeParse({ template: "atlas", accent: "#E0A458", fontStyle: "serif", appearance: "dark" }).success).toBe(true);
    expect(appearanceSchema.safeParse({ template: "generic-saas", accent: "#E0A458", fontStyle: "serif", appearance: "dark" }).success).toBe(false);
  });

  it("rejects an accent that is not a six-digit hex colour", () => {
    expect(appearanceSchema.safeParse({ template: "signal", accent: "mint", fontStyle: "sans", appearance: "dark" }).success).toBe(false);
    expect(appearanceSchema.safeParse({ template: "signal", accent: "#FFF", fontStyle: "sans", appearance: "dark" }).success).toBe(false);
  });
});

describe("validation: projects", () => {
  const base = { name: "BADO", category: "geoscience", status: "in-development" };

  it("accepts an honest in-development project with progress", () => {
    const parsed = projectSchema.safeParse({ ...base, progress: "35", stack: "React\nLeaflet", features: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.progress).toBe(35);
  });

  it("rejects unknown statuses instead of silently inventing one", () => {
    expect(projectSchema.safeParse({ ...base, status: "finished-ish" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, status: "completed" }).success).toBe(true);
  });

  it("clamps progress to 0-100", () => {
    expect(projectSchema.safeParse({ ...base, progress: "140" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, progress: "-1" }).success).toBe(false);
  });

  it("rejects a non-URL demo link", () => {
    expect(projectSchema.safeParse({ ...base, demoUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, demoUrl: "https://bado-seven.vercel.app" }).success).toBe(true);
  });

  it("accepts an empty slug and rejects uppercase or spaced slugs", () => {
    expect(projectSchema.safeParse({ ...base, slug: "" }).success).toBe(true);
    expect(projectSchema.safeParse({ ...base, slug: "BADO App" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, slug: "bado-app" }).success).toBe(true);
  });
});

describe("validation: contact form", () => {
  const valid = {
    name: "Ada",
    email: "ada@example.com",
    message: "I would like to talk about a geoscience data project.",
  };

  it("accepts a real enquiry", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects messages that are too short", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(contactSchema.safeParse({ ...valid, website: "http://spam.example" }).success).toBe(false);
  });
});

describe("validation: portfolio slugs", () => {
  it("accepts handles and rejects reserved shapes", () => {
    expect(portfolioSlugSchema.parse("israel-kolawole")).toBe("israel-kolawole");
    expect(portfolioSlugSchema.safeParse("Israel").success).toBe(false);
    expect(portfolioSlugSchema.safeParse("a").success).toBe(false);
    expect(portfolioSlugSchema.safeParse("-leading").success).toBe(false);
    expect(portfolioSlugSchema.safeParse("double--hyphen").success).toBe(false);
  });
});

describe("domain helpers", () => {
  it("computes completeness from weights that sum to 100", () => {
    const empty = completeness({ title: "", headline: "", bio: "", email: "", socialLinks: 0, projects: 0, skills: 0, experiences: 0, education: 0, certifications: 0 });
    expect(empty.score).toBe(0);
    expect(empty.checks.reduce((sum, check) => sum + check.weight, 0)).toBe(100);

    const full = completeness({ title: "AI Engineer", headline: "AI applications", bio: "x".repeat(120), email: "a@b.co", avatarUrl: "/a.png", socialLinks: 1, projects: 3, skills: 5, experiences: 1, education: 1, certifications: 1 });
    expect(full.score).toBe(100);
  });

  it("treats missing section config as the defaults, and preserves order", () => {
    expect(sectionsOrDefault(null).map((section) => section.id)).toEqual(DEFAULT_SECTIONS.map((section) => section.id));
    const stored = JSON.stringify([{ ...DEFAULT_SECTIONS[1], visible: false }]);
    const merged = sectionsOrDefault(stored);
    expect(merged).toHaveLength(DEFAULT_SECTIONS.length);
    expect(merged.find((section) => section.id === DEFAULT_SECTIONS[1].id)?.visible).toBe(false);
  });

  it("marks in-development and planned work as in progress", () => {
    expect(isWorkInProgress("in-development")).toBe(true);
    expect(isWorkInProgress("planned")).toBe(true);
    expect(isWorkInProgress("live")).toBe(false);
    expect(isWorkInProgress("completed")).toBe(false);
  });

  it("filters hidden sections server-side", () => {
    const sections = [{ visible: true }, { visible: false }];
    expect(visibleSections(sections)).toHaveLength(1);
  });
});

describe("security helpers", () => {
  it("never escalates a requested role to OWNER", () => {
    expect(assignableRole("OWNER")).toBe("USER");
    expect(assignableRole({ role: "OWNER" })).toBe("USER");
  });

  it("blocks open redirects after sign-in", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("/dashboard/projects?tab=1")).toBe("/dashboard/projects?tab=1");
  });

  it("only lets a user manage their own portfolio, and admins manage any", () => {
    const owner = { id: "u1", role: "USER" as const };
    const other = { id: "u2", role: "USER" as const };
    const admin = { id: "u3", role: "OWNER" as const };
    expect(canManagePortfolio(owner, { userId: "u1" })).toBe(true);
    expect(canManagePortfolio(owner, { userId: "u2" })).toBe(false);
    expect(canManagePortfolio(admin, { userId: "u2" })).toBe(true);
    expect(canManagePortfolio(null, { userId: "u1" })).toBe(false);
    expect(canAdminister(owner)).toBe(false);
    expect(canAdminister(admin)).toBe(true);
  });

  it("only exposes published portfolios publicly", () => {
    expect(canReadPublishedPortfolio({ published: false })).toBe(false);
    expect(canReadPublishedPortfolio({ published: true })).toBe(true);
    expect(canReadPublishedPortfolio(null)).toBe(false);
  });

  it("slugifies names deterministically and formats dates safely", () => {
    expect(slugify("Israel Kolawole — AI Engineer")).toBe("israel-kolawole-ai-engineer");
    expect(slugify("  ")).toBe("");
    expect(formatDate(null)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});
