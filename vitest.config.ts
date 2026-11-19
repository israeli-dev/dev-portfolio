import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Tests run against a real in-memory Postgres (PGlite), not mocks of the data
 * layer: the schema, SQL and constraint behaviour under test are the same ones
 * production runs. `singleFork` keeps one PGlite instance alive per run;
 * `tests/setup.ts` truncates between files via `resetDatabase()`.
 */
export default defineConfig({
  // Match Next.js: JSX is compiled with the automatic runtime.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 20_000,
    hookTimeout: 30_000,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
