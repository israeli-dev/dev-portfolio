/**
 * Create the schema on whatever DATABASE_URL points at, without seeding.
 *
 *   DATABASE_URL="postgres://…" npm run db:schema
 *
 * Useful in CI, or when provisioning a production database before the first
 * deploy. `npm run db:seed` does the same thing *and* inserts the owner
 * portfolio, so most people only need that.
 */
import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  const target = process.env.DATABASE_URL ?? "file:.data/pglite";
  const safeTarget = target.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
  console.log(`Applying schema to ${safeTarget}`);

  await db.$ensureSchema();
  console.log("Schema is up to date.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
