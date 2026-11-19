/**
 * Sync a portfolio's projects from GitHub without opening the dashboard.
 *
 *   npx tsx scripts/sync-github.ts [username] [portfolio-slug]
 *
 * Uses the same code path as the dashboard button (`syncGithubForPortfolio`),
 * so it is a genuine end-to-end check of the API client, caching, curation
 * rules and database writes. Requires GITHUB_TOKEN for anything beyond the
 * unauthenticated 60 requests/hour limit.
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { syncGithubForPortfolio } from "../src/lib/github-sync";

async function main() {
  const username = process.argv[2] ?? process.env.GITHUB_USERNAME ?? "israeli-dev";
  const slug = process.argv[3] ?? process.env.SEED_PORTFOLIO_SLUG ?? "israel-kolawole";

  const portfolio = await db.portfolio.findUnique({ where: { slug } });
  if (!portfolio) {
    console.error(`No portfolio with slug "${slug}". Run npm run db:seed first.`);
    process.exit(1);
  }

  const result = await syncGithubForPortfolio(portfolio.id, username);
  console.log("Sync result:", JSON.stringify(result, null, 2));

  const projects = await db.project.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { sortOrder: "asc" },
  });

  console.log(`\n${projects.length} project records:`);
  for (const project of projects) {
    const origin = project.repoUrl ? "github" : "manual";
    console.log(`  ${project.name.padEnd(26)} ${project.status.padEnd(15)} ${String(project.progress ?? "-").padStart(3)}%  ${origin}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
