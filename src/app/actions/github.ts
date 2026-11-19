"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManagePortfolio } from "@/lib/permissions";
import { syncGithubForPortfolio } from "@/lib/github-sync";
import { normaliseGithubUsername } from "@/lib/github";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Trigger a GitHub synchronisation for the signed-in user's portfolio.
 *
 * The token lives in the server environment only; the client receives a
 * summary object, never credentials. Results are passed back through the URL
 * so the console can render them after the redirect.
 */
export async function syncGithubAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/github");

  const portfolioId = String(formData.get("portfolioId") ?? "");
  const portfolio = portfolioId
    ? await db.portfolio.findUnique({ where: { id: portfolioId } })
    : await db.portfolio.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

  if (!portfolio || !canManagePortfolio(user, portfolio)) redirect("/dashboard?denied=portfolio");

  const limited = rateLimit(`github-sync:${user.id}`, 3, 60 * 1000);
  if (!limited.ok) {
    redirect(`/dashboard/github?syncError=${encodeURIComponent(`Wait ${limited.retryAfterSeconds}s before syncing again.`)}`);
  }

  const username = normaliseGithubUsername(String(formData.get("username") ?? "")) ?? normaliseGithubUsername(portfolio.slug) ?? "";
  const target = username || (await db.gitHubIntegration.findUnique({ where: { portfolioId: portfolio.id } }))?.username || "";

  if (!target) {
    redirect(`/dashboard/github?syncError=${encodeURIComponent("Add a GitHub username first.")}`);
  }

  try {
    const result = await syncGithubForPortfolio(portfolio.id, target);
    revalidatePath("/dashboard/github");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard");
    revalidatePath(`/u/${portfolio.slug}`);

    const summary = result.notModified
      ? "Up to date — nothing changed since the last sync."
      : `${result.imported} imported, ${result.updated} refreshed, ${result.skipped} skipped.`;

    redirect(
      `/dashboard/github?sync=${encodeURIComponent(summary)}&suggestions=${result.suggestionCount}${
        result.rateRemaining !== null ? `&remaining=${result.rateRemaining}` : ""
      }`,
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("rate limit")
        ? "GitHub rate limit reached. Wait for the reset window or configure GITHUB_TOKEN."
        : error instanceof Error
          ? error.message
          : "GitHub sync failed.";
    redirect(`/dashboard/github?syncError=${encodeURIComponent(message)}`);
  }
}

export async function disconnectGithubAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/github");
  const portfolioId = String(formData.get("portfolioId") ?? "");
  const portfolio = await db.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio || !canManagePortfolio(user, portfolio)) redirect("/dashboard?denied=portfolio");

  // Imported projects stay in place; the user decides what to exclude.
  await db.gitHubIntegration.deleteMany({ where: { portfolioId: portfolio.id } });
  revalidatePath("/dashboard/github");
  redirect("/dashboard/github?notice=GitHub%20connection%20removed");
}
