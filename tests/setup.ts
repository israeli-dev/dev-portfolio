import { vi } from "vitest";

/**
 * Global test environment.
 *
 * 1. Point the data layer at a throwaway in-memory Postgres.
 * 2. Replace the three Next.js request primitives the server actions depend on
 *    with small in-memory equivalents, so actions execute their real code paths
 *    (validation → database → cookie) without a browser or a running server.
 */
process.env.DATABASE_URL = "memory:";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";

vi.mock("next/headers", async () => {
  const request = await import("./support/request");
  return {
    cookies: async () => request.cookieStore,
    headers: async () => request.headerStore,
    draftMode: async () => ({ isEnabled: false, enable: () => {}, disable: () => {} }),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

vi.mock("next/navigation", async () => {
  const request = await import("./support/request");
  return {
    redirect: request.redirect,
    permanentRedirect: request.redirect,
    notFound: () => {
      throw Object.assign(new Error("NEXT_NOT_FOUND"), { digest: "NEXT_NOT_FOUND" });
    },
  };
});
