/**
 * Authorization rules, kept pure so they can be unit-tested and reused by
 * server actions, route handlers and page-level guards alike.
 */

export interface Actor {
  id: string;
  role: "USER" | "OWNER";
}

export interface PortfolioOwnership {
  userId: string;
}

export function isOwner(actor: Pick<Actor, "role"> | null | undefined): boolean {
  return actor?.role === "OWNER";
}

/** Owners may edit their own portfolio; admins may edit any portfolio. */
export function canManagePortfolio(actor: Actor | null | undefined, portfolio: PortfolioOwnership | null | undefined): boolean {
  if (!actor || !portfolio) return false;
  return actor.role === "OWNER" || actor.id === portfolio.userId;
}

/** Only the owner may edit another user's public page or open the admin console. */
export function canAdminister(actor: Actor | null | undefined): boolean {
  return actor?.role === "OWNER";
}

/**
 * Public visibility: a portfolio is readable by anyone only when published.
 * Signed-in owners still need the published flag for the public route — draft
 * previews use the authenticated /dashboard/preview route instead.
 */
export function canReadPublishedPortfolio(portfolio: { published: boolean } | null | undefined): boolean {
  return Boolean(portfolio?.published);
}

/** Users can only act on their own contact inbox; owners can moderate all. */
export function canManageMessages(actor: Actor | null | undefined, ownerUserId: string): boolean {
  if (!actor) return false;
  return actor.id === ownerUserId || actor.role === "OWNER";
}

/**
 * Section-level publication. Users choose which blocks are public, and the
 * renderer must filter by this, never by CSS or client-side state.
 */
export function visibleSections<T extends { visible: boolean }>(sections: T[]): T[] {
  return sections.filter((section) => section.visible);
}

/** Guard against privilege escalation through crafted form payloads. */
export function assignableRole(requested: unknown): "USER" {
  void requested;
  return "USER";
}
