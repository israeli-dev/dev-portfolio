import type { PortfolioView } from "@/lib/portfolio-view";
import { DEFAULT_SECTIONS } from "@/lib/domain";
import { PROFESSION_PRESETS, TEMPLATES, type ProfessionPreset, type TemplateId } from "@/lib/templates";

/**
 * Sample content for template previews only.
 *
 * Clearly marked as a preview persona in the UI — this is never seeded into a
 * real user's portfolio and never presented as the owner's work.
 */
export const PREVIEW_PERSONA = {
  name: "Jordan Adeyemi",
  label: "Preview persona · sample content",
};

export function buildPreviewView(options: {
  template: TemplateId;
  preset?: ProfessionPreset;
  accent?: string;
  appearance?: "dark" | "light";
  font?: "sans" | "serif" | "mono";
  /** Used for the owner's own builder preview: real name, sample body copy. */
  name?: string;
}): PortfolioView {
  const template = TEMPLATES.find((item) => item.id === options.template) ?? TEMPLATES[0];
  const preset = options.preset ?? PROFESSION_PRESETS[0];
  const name = options.name ?? PREVIEW_PERSONA.name;
  const sample = preset.sampleProject;

  return {
    slug: "preview",
    title: `${name} — ${preset.label}`,
    headline: preset.headline,
    bio: preset.bio,
    location: "Lagos, Nigeria",
    email: "hello@example.com",
    availability: "Open to new opportunities",
    avatarUrl: null,
    coverUrl: null,
    template: options.template,
    accent: options.accent ?? template.defaultAccent,
    fontStyle: options.font ?? template.defaultFont,
    appearance: options.appearance ?? template.defaultAppearance,
    published: true,
    sections: DEFAULT_SECTIONS,
    socialLinks: [
      { label: "GitHub", url: "https://github.com" },
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "Email", url: "mailto:hello@example.com" },
    ],
    skillGroups: [
      { name: "Core", skills: preset.skills.map((skill, index) => ({ name: skill, learning: index === preset.skills.length - 1 })) },
      { name: "Working with", skills: [{ name: "Documentation", learning: false }, { name: "Mentoring", learning: false }] },
    ],
    experiences: [
      {
        id: "exp-1",
        role: `Senior ${preset.label}`,
        organization: "Northwind Studio",
        startDate: "2023",
        endDate: "",
        current: true,
        location: "Remote",
        summary:
          "Sample experience entry. In a real portfolio this is replaced with the person's own role, organisation and dates.",
        highlights: ["Sample achievement written by the portfolio owner", "Another concrete outcome with a number in it"],
        tech: preset.skills.slice(0, 3),
      },
      {
        id: "exp-2",
        role: preset.label,
        organization: "Fieldwork Collective",
        startDate: "2021",
        endDate: "2023",
        current: false,
        location: "Lagos",
        summary: "Earlier role demonstrating how the timeline handles past positions.",
        highlights: [],
        tech: [],
      },
    ],
    education: [
      {
        id: "edu-1",
        degree: "B.Sc. — sample degree",
        institution: "Sample University",
        year: "2020",
        location: "Nigeria",
        detail: "Sample education entry. Replace with your own institution and programme.",
      },
    ],
    certifications: [
      { id: "cert-1", title: "Sample certification", issuer: "Sample body", year: "2024", url: "", learning: false },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "Sample achievement — replace with a verified one",
        detail: "Preview content only. Real portfolios never invent awards.",
        year: "2024",
        kind: "award",
      },
    ],
    projects: [
      {
        id: "project-1",
        slug: "sample-project",
        name: sample.name,
        tagline: sample.tagline,
        description:
          "A longer description of the work: the problem, the approach and the outcome. Preview text only, kept short so the layout can be judged honestly.",
        category: "web-applications",
        status: "live",
        progress: null,
        repoUrl: "https://github.com",
        repoName: "sample-project",
        demoUrl: "https://example.com",
        imageUrl: null,
        stack: preset.skills.slice(0, 4),
        features: ["Sample feature one", "Sample feature two", "Sample feature three"],
        problem: "The specific problem this project set out to solve.",
        contribution: "What this person personally designed, built or led.",
        architecture: "A short note on how the system is put together.",
        featured: true,
        language: "TypeScript",
        stars: 0,
        forks: 0,
        lastPushedAt: null,
        images: [],
        sortOrder: 0,
      },
      {
        id: "project-2",
        slug: "second-project",
        name: "Second Sample Project",
        tagline: "A second entry so the project layout can be evaluated properly.",
        description: "Preview text. Replace with a real project from your own repository.",
        category: "developer-tools",
        status: "in-development",
        progress: 40,
        repoUrl: "https://github.com",
        repoName: "second-project",
        demoUrl: null,
        imageUrl: null,
        stack: preset.skills.slice(1, 5),
        features: ["Sample feature"],
        problem: "",
        contribution: "",
        architecture: "",
        featured: false,
        language: "Python",
        stars: 0,
        forks: 0,
        lastPushedAt: null,
        images: [],
        sortOrder: 1,
      },
      {
        id: "project-3",
        slug: "third-project",
        name: "Archive & Notes",
        tagline: "A smaller experiment, shown to test how minor work is treated.",
        description: "Preview text.",
        category: "experimental",
        status: "completed",
        progress: null,
        repoUrl: "https://github.com",
        repoName: null,
        demoUrl: null,
        imageUrl: null,
        stack: preset.skills.slice(2, 4),
        features: [],
        problem: "",
        contribution: "",
        architecture: "",
        featured: false,
        language: "Python",
        stars: 0,
        forks: 0,
        lastPushedAt: null,
        images: [],
        sortOrder: 2,
      },
    ],
  };
}
