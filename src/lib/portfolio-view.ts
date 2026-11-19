import { parseList, type SectionConfig } from "@/lib/json";
import { sectionsOrDefault } from "@/lib/domain";

export interface SocialLinkView {
  label: string;
  url: string;
}

export interface SkillView {
  name: string;
  learning: boolean;
}

export interface SkillGroupView {
  name: string;
  skills: SkillView[];
}

export interface ExperienceView {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  summary: string;
  highlights: string[];
  tech: string[];
}

export interface EducationView {
  id: string;
  degree: string;
  institution: string;
  year: string;
  location: string;
  detail: string;
}

export interface CertificationView {
  id: string;
  title: string;
  issuer: string;
  year: string;
  url: string;
  learning: boolean;
}

export interface AchievementView {
  id: string;
  title: string;
  detail: string;
  year: string;
  kind: string;
}

export interface ProjectView {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  progress: number | null;
  repoUrl: string | null;
  repoName: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  stack: string[];
  features: string[];
  problem: string;
  contribution: string;
  architecture: string;
  featured: boolean;
  language: string | null;
  stars: number;
  forks: number;
  lastPushedAt: string | null;
  images: { url: string; alt: string }[];
  sortOrder: number;
}

export interface PortfolioView {
  slug: string;
  title: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  availability: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  template: string;
  accent: string;
  fontStyle: string;
  appearance: string;
  published: boolean;
  sections: SectionConfig[];
  socialLinks: SocialLinkView[];
  skillGroups: SkillGroupView[];
  experiences: ExperienceView[];
  education: EducationView[];
  certifications: CertificationView[];
  achievements: AchievementView[];
  projects: ProjectView[];
}

/**
 * Row shapes returned by the data layer. Declared locally so the view model is
 * independent of the query implementation.
 */
export interface PortfolioWithRelations {
  id: string;
  userId: string;
  slug: string;
  title: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  availability: string;
  template: string;
  accent: string;
  fontStyle: string;
  appearance: string;
  published: boolean;
  publishedAt: Date | null;
  sections: string;
  createdAt: Date;
  updatedAt: Date;
  socialLinks: { label: string; url: string; sortOrder: number }[];
  skillGroups: { id: string; name: string; sortOrder: number; skills: SkillRecord[] }[];
  skills: SkillRecord[];
  experiences: ExperienceRecord[];
  education: EducationRecord[];
  certifications: CertificationRecord[];
  achievements: AchievementRecord[];
  projects: ProjectRecord[];
}

export interface SkillRecord {
  id: string;
  portfolioId: string;
  groupId: string | null;
  name: string;
  learning: boolean;
  sortOrder: number;
}

export interface ProjectImageRecord {
  id: string;
  projectId: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProjectRecord {
  id: string;
  portfolioId: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  progress: number | null;
  repoUrl: string | null;
  repoName: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  stack: string;
  features: string;
  problem: string;
  contribution: string;
  architecture: string;
  featured: boolean;
  published: boolean;
  excluded: boolean;
  source: string;
  githubRepoId: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastPushedAt: Date | null;
  readmeNote: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  images: ProjectImageRecord[];
}

interface ExperienceRecord {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: string | null;
  summary: string;
  highlights: string;
  tech: string;
  sortOrder: number;
}

interface EducationRecord {
  id: string;
  degree: string;
  institution: string;
  year: string | null;
  location: string | null;
  detail: string;
  sortOrder: number;
}

interface CertificationRecord {
  id: string;
  title: string;
  issuer: string;
  year: string | null;
  url: string | null;
  learning: boolean;
  sortOrder: number;
}

interface AchievementRecord {
  id: string;
  title: string;
  detail: string;
  year: string | null;
  kind: string;
  sortOrder: number;
}

export function toProjectView(project: ProjectRecord): ProjectView {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    description: project.description,
    category: project.category,
    status: project.status,
    progress: project.progress,
    repoUrl: project.repoUrl,
    repoName: project.repoName,
    demoUrl: project.demoUrl,
    imageUrl: project.imageUrl,
    stack: parseList(project.stack),
    features: parseList(project.features),
    problem: project.problem,
    contribution: project.contribution,
    architecture: project.architecture,
    featured: project.featured,
    language: project.language,
    stars: project.stars,
    forks: project.forks,
    lastPushedAt: project.lastPushedAt ? project.lastPushedAt.toISOString() : null,
    images: project.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({ url: image.url, alt: image.alt })),
    sortOrder: project.sortOrder,
  };
}

export function toPortfolioView(input: PortfolioWithRelations): PortfolioView {
  const groupMap = new Map(
    input.skillGroups
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((group) => [group.id, group.name]),
  );

  const groups: SkillGroupView[] = input.skillGroups
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      name: group.name,
      skills: group.skills
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((skill) => ({ name: skill.name, learning: skill.learning })),
    }))
    .filter((group) => group.skills.length > 0);

  // Ungrouped skills still need to be shown; put them in a "Core" group.
  const ungrouped = input.skills
    .filter((skill) => !skill.groupId || !groupMap.has(skill.groupId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((skill) => ({ name: skill.name, learning: skill.learning }));
  if (ungrouped.length) groups.push({ name: "Core", skills: ungrouped });

  const sections = sectionsOrDefault(input.sections);
  // Section visibility is enforced in the view model, not with CSS: hiding
  // Contact also withholds the address from the hero and from structured data.
  const contactVisible = sections.find((section) => section.id === "contact")?.visible !== false;

  return {
    slug: input.slug,
    title: input.title,
    headline: input.headline,
    bio: input.bio,
    location: input.location,
    email: contactVisible ? input.email : "",
    availability: input.availability,
    avatarUrl: input.avatarUrl,
    coverUrl: input.coverUrl,
    template: input.template,
    accent: input.accent,
    fontStyle: input.fontStyle,
    appearance: input.appearance,
    published: input.published,
    sections,
    socialLinks: input.socialLinks
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((link) => ({ label: link.label, url: link.url })),
    skillGroups: groups,
    experiences: input.experiences
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((experience) => ({
        id: experience.id,
        role: experience.role,
        organization: experience.organization,
        startDate: experience.startDate,
        endDate: experience.endDate ?? "",
        current: experience.current,
        location: experience.location ?? "",
        summary: experience.summary,
        highlights: parseList(experience.highlights),
        tech: parseList(experience.tech),
      })),
    education: input.education
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((education) => ({
        id: education.id,
        degree: education.degree,
        institution: education.institution,
        year: education.year ?? "",
        location: education.location ?? "",
        detail: education.detail,
      })),
    certifications: input.certifications
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((certification) => ({
        id: certification.id,
        title: certification.title,
        issuer: certification.issuer,
        year: certification.year ?? "",
        url: certification.url ?? "",
        learning: certification.learning,
      })),
    achievements: input.achievements
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        detail: achievement.detail,
        year: achievement.year ?? "",
        kind: achievement.kind,
      })),
    projects: input.projects
      .filter((project) => project.published && !project.excluded)
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      })
      .map(toProjectView),
  };
}
