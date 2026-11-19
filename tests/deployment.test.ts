import { afterEach, describe, expect, it } from "vitest";
import { siteUrl } from "@/lib/site";
import { saveImageUpload, UploadError } from "@/lib/storage";

const ENV_KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;
const original = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("canonical URL resolution", () => {
  it("prefers the explicit site URL and strips a trailing slash", () => {
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://folio.example/";
    expect(siteUrl()).toBe("https://folio.example");
  });

  it("falls back to the production Vercel host, then the deployment host", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "folio.example";
    process.env.VERCEL_URL = "folio-git-preview.vercel.app";
    expect(siteUrl()).toBe("https://folio.example");

    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    expect(siteUrl()).toBe("https://folio-git-preview.vercel.app");
  });

  it("uses localhost when nothing is configured", () => {
    for (const key of ENV_KEYS) delete process.env[key];
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});

describe("upload validation before any disk write", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0x02, 0x03]);

  it("rejects SVG and other non-raster payloads", async () => {
    const svg = new File([new TextEncoder().encode("<svg><script>alert(1)</script></svg>")], "x.svg", { type: "image/svg+xml" });
    await expect(saveImageUpload(svg, "user-1234")).rejects.toBeInstanceOf(UploadError);
    await expect(saveImageUpload(svg, "user-1234")).rejects.toThrow(/PNG, JPEG or WebP/);
  });

  it("rejects files larger than 2 MB", async () => {
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    await expect(saveImageUpload(big, "user-1234")).rejects.toThrow(/2 MB/);
  });

  it("rejects empty files and malformed account ids", async () => {
    await expect(saveImageUpload(new File([], "empty.png", { type: "image/png" }), "user-1234")).rejects.toThrow(/empty/);
    await expect(saveImageUpload(new File([png], "ok.png", { type: "image/png" }), "../etc")).rejects.toThrow(/Invalid account/);
  });
});
