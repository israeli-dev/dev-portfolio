# Folio

Folio is a portfolio platform with two halves that share one codebase:

1. **An editorial, single-owner portfolio** at `/` for **Israel Kolawole — AI Engineer / AI application developer** working across geoscience and applied AI. Every project on it is derived from his real GitHub account (`israeli-dev`), with honest status labels: shipped and deployed, in development, or planned.
2. **A multi-tenant portfolio builder** for other people: sign up, complete a ten-step wizard, choose one of four genuinely different templates, customise theme and typography, preview instantly, and publish at `/u/<handle>` with SEO metadata — or unpublish in one click.

Nothing on the site is decorative software. Every button performs an action, every form validates, every claim about a project traces back to a repository or is explicitly marked as under construction.

---

## Quick start

```bash
# Node 20.11+ (developed on Node 22)
npm install
cp .env.example .env          # then edit if you want a different owner password
npm run db:seed               # creates the schema and the owner's portfolio
npm run dev                   # http://localhost:3000
```

The seeded owner account:

| Field | Value |
| --- | --- |
| Email | `owner@folio.local` |
| Password | value of `SEED_OWNER_PASSWORD` in `.env` (`folio-owner-2026` by default in this checkout) |

The owner account can open `/dashboard` (its own portfolio editor) **and** `/admin` (platform console). Accounts created through `/signup` are ordinary users and cannot reach `/admin` — enforced on the server, not by hiding links.

No external service is required. The database is **PGlite** (PostgreSQL compiled to WebAssembly) persisted in `.data/pglite`, so the entire product runs offline. Point `DATABASE_URL` at a real `postgres://` URL for production — the schema and queries are unchanged.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with fast refresh |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` across app and tests |
| `npm test` | 108 Vitest tests against an in-memory Postgres |
| `npm run db:seed` | Idempotent schema creation + seed (owner, portfolio, projects) |
| `npm run db:schema` | Create/upgrade the schema only, without seeding |
| `npm run db:reset` | Delete `.data/` and re-seed from scratch |
| `npm run sync:github -- israeli-dev` | Run a real GitHub sync from the CLI |

> **PGlite is single-process.** Stop `npm run dev` before running `db:seed`, `db:reset` or `sync:github`, then restart it: two processes cannot safely share one PGlite directory. On Postgres this limitation disappears.

## Deploying

Vercel works out of the box **with a managed Postgres** — PGlite's directory does not survive a serverless filesystem. Import the repo, set `DATABASE_URL` (with `?sslmode=require`), `NEXT_PUBLIC_SITE_URL` and `SEED_OWNER_PASSWORD`, deploy, then run `npm run db:seed` once from your machine against the production URL.

The only feature that needs extra work on Vercel is image upload: the filesystem is read-only there, so `/api/uploads` returns a clear 501 and you paste an image URL instead. Step-by-step instructions, environment variables and the full difference list: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## What is in the product

### Owner portfolio (`/`)
- Hero with real identity, current focus, and links to live deployments.
- About/journey timeline, skills, experience, education, achievements, and a "currently learning" block.
- Featured projects with category filters, real screenshot galleries where the project has them, and a six-value status vocabulary: **live, completed, in development, experimental, planned, archived**.
- A "Currently building" panel driven by the same project records, so it cannot drift out of sync.
- Working contact form: validated, honeypot-protected, rate-limited, stored in the database inbox (and emailed if `RESEND_API_KEY` is set).

### Builder (`/signup` → `/dashboard`)
- Sign up, sign in, sign out, forgot/reset password (single-use tokens, 30-minute expiry, all sessions revoked on reset).
- Ten-step wizard: profession → template → profile → experience → education → skills → projects → appearance → preview → publish, with progress persisted as you go.
- Dashboard with publication state, profile-completeness scoring (transparent weights that sum to 100), recent activity, and inbox count.
- Content editors for experience, education, skills (grouped), achievements, certifications, social links, and projects (manual or GitHub-imported).
- Appearance: four templates, accent colour, font family, dark/light, per-section visibility switches.
- Live preview at `/dashboard/preview` using the same renderer as the public page.
- Publish/unpublish with a public URL, canonical metadata, Open Graph/Twitter cards, `Person` JSON-LD, sitemap and robots rules.

### Templates
Four hand-built layouts sharing one design language rather than one layout with different colours:

| Template | Category | Character |
| --- | --- | --- |
| `signal` | Technology | Dense engineering dashboard: status chips, stack rails, metrics |
| `monograph` | Academic / research | Serif editorial, numbered citations, restrained margins |
| `atlas` | Engineering / geoscience | Field plate: split hero, annotated figures, data tables |
| `terminal` | Creative / technical | Monospaced console aesthetic for developer portfolios |

All four are previewable at `/templates` and `/templates/[id]` before signing up.

### GitHub integration (`/dashboard/github`)
- Uses the official REST API (`api.github.com`), server-side only. Tokens never reach the browser.
- Discovers repositories, excludes forks/private/empty/shell repos, imports language composition from the languages endpoint.
- ETag + `If-None-Match` caching, `rate_remaining`/`rate_reset` persisted, and a per-user 3-per-minute sync limit.
- Owner curation wins: names, taglines, descriptions, categories, status, progress, screenshots, demo links and exclusion are never overwritten by a later sync. Metadata that GitHub actually owns (stars, forks, language, last push, stack) is refreshed.
- README text is offered as a *suggestion* when a repository has no description; it is never applied silently.
- Import never decides a project is "completed" — at most "live" when a homepage exists, otherwise "in development".

### Admin console (`/admin`)
- Platform statistics, user list with roles, portfolio inventory, integration/system diagnostics.
- Every route re-checks the session server-side; `role !== "OWNER"` redirects to `/dashboard?denied=admin`.

---

## Routes

| Route | Access |
| --- | --- |
| `/` | Public — owner's editorial portfolio |
| `/projects`, `/projects/[slug]` | Public — full project index and case studies |
| `/templates`, `/templates/[id]` | Public — template gallery and live previews |
| `/signup`, `/login`, `/forgot-password`, `/reset-password` | Public |
| `/u/[slug]` | Public **only when published**; unpublished handles 404 for everyone |
| `/dashboard` | Signed in |
| `/dashboard/{wizard,projects,projects/new,projects/[id],profile,content,appearance,github,inbox,preview,settings}` | Signed in |
| `/admin`, `/admin/{users,portfolio,system}` | Platform owner only |
| `/api/health` | Public — database probe and integration flags (no secrets) |
| `/api/uploads` | Signed in — validated image upload |

---

## Security in one paragraph

Passwords are hashed with scrypt (N=16384, r=8, p=1) and never logged. Sessions are opaque 256-bit tokens stored as SHA-256 hashes, delivered in an `HttpOnly`, `SameSite=Lax` cookie with a 14-day TTL. Password changes and resets revoke every session. Every server action re-derives the actor from the session and re-checks ownership; portfolio mutations scope SQL by `portfolioId` **and** actor. All SQL values are parameterised and identifiers come from a static table map, so user input cannot reach an identifier position. Zod validates every form payload; URLs must be `http(s)`. Uploads are limited to 2 MB, checked by magic bytes (PNG/JPEG/WebP, SVG rejected) and written to UUID filenames. Rate limits cover sign-in, sign-up, password reset, contact messages and GitHub sync. Security headers are set in `next.config.ts`.

Details and threat notes: [`docs/SECURITY.md`](docs/SECURITY.md).

---

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layers, data model, the custom query facade and why Prisma/Drizzle are not used, rendering pipeline.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — environment variables, Postgres setup, migrations, seeding, hosting notes, backups.
- [`docs/TESTING.md`](docs/TESTING.md) — what the 108 tests cover, how the harness works, what was verified manually.
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — honest gaps and what I would build next.
- [`docs/SECURITY.md`](docs/SECURITY.md) — auth model, authorization matrix, hardening checklist.

## Project layout

```
src/
  app/            routes: (site), (auth), u/[slug], dashboard, admin, actions, api
  components/     ui primitives, marketing sections, dashboard shell, portfolio templates
  content/        editorial copy for the owner's portfolio
  db/             schema.sql (authoritative DDL), schema.ts, seed.ts
  lib/            db facade, auth/session, permissions, validation, github, queries
tests/            auth, authorization, isolation, portfolio CRUD, publishing, rendering, github, validation
scripts/          sync-github.ts (CLI sync through the same code path as the UI)
```

## Licence

Source is provided for review. Portfolio content and project copy belong to Israel Kolawole. GitHub data is used under the GitHub API terms; screenshots belong to their projects.
