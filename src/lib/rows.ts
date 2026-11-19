/**
 * Row types for the data layer.
 *
 * Plain object shapes (camelCase) that mirror the SQL schema. They are shared by
 * the query facade, the repositories and the view models so a schema change
 * surfaces as a type error rather than a runtime surprise.
 */

export interface UserRow {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRow {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent: string | null;
  ip: string | null;
}

export interface PortfolioRow {
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
}

export interface ProjectRow {
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
}

export interface ProjectImageRow {
  id: string;
  projectId: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface SkillRow {
  id: string;
  portfolioId: string;
  groupId: string | null;
  name: string;
  learning: boolean;
  sortOrder: number;
}

export interface SkillGroupRow {
  id: string;
  portfolioId: string;
  name: string;
  sortOrder: number;
}

export interface SocialLinkRow {
  id: string;
  portfolioId: string;
  label: string;
  url: string;
  sortOrder: number;
}

export interface ExperienceRow {
  id: string;
  portfolioId: string;
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

export interface EducationRow {
  id: string;
  portfolioId: string;
  degree: string;
  institution: string;
  year: string | null;
  location: string | null;
  detail: string;
  sortOrder: number;
}

export interface CertificationRow {
  id: string;
  portfolioId: string;
  title: string;
  issuer: string;
  year: string | null;
  url: string | null;
  learning: boolean;
  sortOrder: number;
}

export interface AchievementRow {
  id: string;
  portfolioId: string;
  title: string;
  detail: string;
  year: string | null;
  kind: string;
  sortOrder: number;
}

export interface TimelineRow {
  id: string;
  year: string;
  title: string;
  detail: string;
  kind: string;
  verified: boolean;
  sortOrder: number;
}

export interface OwnerProfileRow {
  id: string;
  fullName: string;
  title: string;
  tagline: string;
  story: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedin: string;
  twitter: string;
  resumeUrl: string | null;
  avatarUrl: string | null;
  updatedAt: Date;
}

export interface GithubIntegrationRow {
  id: string;
  portfolioId: string;
  username: string;
  lastSyncedAt: Date | null;
  etag: string | null;
  rateRemaining: number | null;
  rateReset: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessageRow {
  id: string;
  userId: string | null;
  portfolioId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface ActivityLogRow {
  id: string;
  portfolioId: string;
  action: string;
  detail: string;
  createdAt: Date;
}

export interface PasswordResetTokenRow {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

/** A portfolio with every related record loaded, as returned by the repositories. */
export type PortfolioFull = PortfolioRow & {
  socialLinks: SocialLinkRow[];
  skillGroups: (SkillGroupRow & { skills: SkillRow[] })[];
  skills: SkillRow[];
  experiences: ExperienceRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
  achievements: AchievementRow[];
  projects: (ProjectRow & { images: ProjectImageRow[] })[];
};

export type PortfolioWithUser = PortfolioFull & {
  user: Pick<UserRow, "id" | "name" | "email" | "role">;
  github: GithubIntegrationRow | null;
};

export type PortfolioDashboard = PortfolioFull & {
  github: GithubIntegrationRow | null;
  activity: ActivityLogRow[];
  messages: ContactMessageRow[];
};
