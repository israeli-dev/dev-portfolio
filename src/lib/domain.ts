import { parseSections, type SectionConfig } from "@/lib/json";

export const PROJECT_CATEGORIES = [
  { id: "ai-llm", label: "AI / LLM" },
  { id: "geoscience", label: "Geoscience" },
  { id: "developer-tools", label: "Developer Tools" },
  { id: "web-applications", label: "Web Applications" },
  { id: "data-science", label: "Data Science" },
  { id: "automation", label: "Automation" },
  { id: "experimental", label: "Experimental" },
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]["id"];

export const PROJECT_STATUSES = [
  {
    id: "live",
    label: "Live / Deployed",
    short: "Live",
    description: "Publicly deployed and reachable at a URL.",
    tone: "live",
  },
  {
    id: "completed",
    label: "Completed",
    short: "Completed",
    description: "Finished work without a public deployment.",
    tone: "complete",
  },
  {
    id: "in-development",
    label: "In Development",
    short: "Building",
    description: "Actively being built — not finished.",
    tone: "active",
  },
  {
    id: "experimental",
    label: "Experimental",
    short: "Experimental",
    description: "A prototype or learning experiment.",
    tone: "experiment",
  },
  {
    id: "planned",
    label: "Planned",
    short: "Planned",
    description: "Specified but not yet started.",
    tone: "planned",
  },
  {
    id: "archived",
    label: "Archived",
    short: "Archived",
    description: "No longer maintained.",
    tone: "archived",
  },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["id"];

export function categoryLabel(id: string): string {
  return PROJECT_CATEGORIES.find((category) => category.id === id)?.label ?? "Project";
}

export function statusMeta(id: string): (typeof PROJECT_STATUSES)[number] {
  return PROJECT_STATUSES.find((status) => status.id === id) ?? PROJECT_STATUSES[2];
}

/** Statuses that should never be presented as shipped products. */
export function isWorkInProgress(status: string): boolean {
  return status === "in-development" || status === "experimental" || status === "planned";
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "about", label: "About", visible: true, order: 0 },
  { id: "projects", label: "Projects", visible: true, order: 1 },
  { id: "skills", label: "Skills", visible: true, order: 2 },
  { id: "experience", label: "Experience", visible: true, order: 3 },
  { id: "education", label: "Education", visible: true, order: 4 },
  { id: "achievements", label: "Achievements", visible: true, order: 5 },
  { id: "contact", label: "Contact", visible: true, order: 6 },
];

export function sectionsOrDefault(raw: string | null | undefined): SectionConfig[] {
  const parsed = parseSections(raw);
  if (!parsed.length) return DEFAULT_SECTIONS;
  // Merge in any newly introduced sections so old portfolios still render them.
  const missing = DEFAULT_SECTIONS.filter((section) => !parsed.some((p) => p.id === section.id));
  return [...parsed, ...missing].sort((a, b) => a.order - b.order);
}

export interface CompletenessInput {
  title?: string | null;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  socialLinks: number;
  projects: number;
  skills: number;
  experiences: number;
  education: number;
  certifications: number;
}

export interface CompletenessResult {
  score: number;
  checks: { id: string; label: string; done: boolean; weight: number }[];
}

/**
 * Profile completeness — transparent weights, no invented benchmarks.
 * Used by the dashboard progress ring and the admin setup checklist.
 */
export function completeness(input: CompletenessInput): CompletenessResult {
  const checks = [
    { id: "title", label: "Portfolio title", done: Boolean(input.title?.trim()), weight: 8 },
    { id: "headline", label: "Professional headline", done: Boolean(input.headline?.trim()), weight: 10 },
    { id: "bio", label: "About section (80+ characters)", done: (input.bio?.trim().length ?? 0) >= 80, weight: 15 },
    { id: "email", label: "Contact email", done: Boolean(input.email?.trim()), weight: 7 },
    { id: "avatar", label: "Profile image", done: Boolean(input.avatarUrl), weight: 5 },
    { id: "social", label: "At least one link", done: input.socialLinks > 0, weight: 5 },
    { id: "projects", label: "At least 3 projects", done: input.projects >= 3, weight: 20 },
    { id: "skills", label: "At least 5 skills", done: input.skills >= 5, weight: 10 },
    { id: "experience", label: "Work or field experience", done: input.experiences > 0, weight: 10 },
    { id: "education", label: "Education entry", done: input.education > 0, weight: 5 },
    { id: "certifications", label: "A certification or achievement", done: input.certifications > 0, weight: 5 },
  ];

  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  const done = checks.reduce((sum, check) => sum + (check.done ? check.weight : 0), 0);

  return { score: Math.round((done / total) * 100), checks };
}
