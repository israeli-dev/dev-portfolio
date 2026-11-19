import { cache } from "react";
import { db } from "@/lib/db";
import { toPortfolioView, type PortfolioView } from "@/lib/portfolio-view";
import type {
  ContactMessageRow,
  OwnerProfileRow,
  PortfolioDashboard,
  PortfolioWithUser,
  TimelineRow,
  UserRow,
} from "@/lib/rows";

const portfolioInclude = {
  socialLinks: true,
  skillGroups: { include: { skills: true } },
  skills: true,
  experiences: true,
  education: true,
  certifications: true,
  achievements: true,
  projects: { include: { images: true } },
} as const;

async function loadPortfolioBySlug(slug: string) {
  return db.portfolio.findUnique({
    where: { slug },
    include: {
      ...portfolioInclude,
      user: { select: { id: true, name: true, email: true, role: true } },
      github: true,
    },
  });
}

/** Public page data. Returns null for unpublished portfolios. */
export const getPublishedPortfolio = cache(async (slug: string, includeUnpublished = false): Promise<PortfolioWithUser | null> => {
  const portfolio = (await loadPortfolioBySlug(slug)) as PortfolioWithUser | null;
  if (!portfolio) return null;
  if (!portfolio.published && !includeUnpublished) return null;
  return portfolio;
});

export const getOwnerPortfolio = cache(async (): Promise<{
  owner: UserRow;
  portfolio: PortfolioWithUser;
  view: PortfolioView;
} | null> => {
  const owner = await db.user.findFirst({ where: { role: "OWNER" }, orderBy: { createdAt: "asc" } });
  if (!owner) return null;

  const portfolio = await db.portfolio.findFirst({
    where: { userId: owner.id },
    orderBy: { createdAt: "asc" },
    include: {
      ...portfolioInclude,
      user: { select: { id: true, name: true, email: true, role: true } },
      github: true,
    },
  });
  if (!portfolio) return null;

  const typed = portfolio as PortfolioWithUser;
  return { owner, portfolio: typed, view: toPortfolioView(typed) };
});

export const getOwnerProfile = cache(async (): Promise<OwnerProfileRow | null> =>
  db.ownerProfile.findUnique({ where: { id: "owner" } }),
);

export const getTimeline = cache(async (): Promise<TimelineRow[]> =>
  db.timelineEntry.findMany({ where: { verified: true }, orderBy: { sortOrder: "asc" } }),
);

export async function getPortfolioForUser(userId: string): Promise<PortfolioDashboard | null> {
  const portfolio = await db.portfolio.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      ...portfolioInclude,
      github: true,
      activity: { orderBy: { createdAt: "desc" }, take: 6 },
      messages: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  return portfolio as PortfolioDashboard | null;
}

export async function getPortfolioByIdForOwner(portfolioId: string, userId: string, isOwnerRole: boolean) {
  const portfolio = await db.portfolio.findUnique({ where: { id: portfolioId }, include: portfolioInclude });
  if (!portfolio) return null;
  if (portfolio.userId !== userId && !isOwnerRole) return null;
  return portfolio;
}

/** Real, verifiable counts — never invented marketing numbers. */
export async function getPlatformStats() {
  const [projectCount, publishedCount] = await Promise.all([
    db.project.count({ where: { published: true, excluded: false } }),
    db.portfolio.count({ where: { published: true } }),
  ]);
  return { projectCount, publishedCount };
}

export async function getOwnerInbox(userId: string): Promise<ContactMessageRow[]> {
  return db.contactMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
