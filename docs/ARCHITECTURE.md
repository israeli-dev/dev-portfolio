# Architecture

Folio is a single Next.js 15 application (App Router, React Server Components) with one PostgreSQL database. There is no separate API tier: server actions and route handlers talk to the database through one small data layer, and server components read through typed query functions.

```
Browser
  │  HTML / RSC payload
  ▼
Next.js App Router ── server components ──► src/lib/queries.ts ─┐
  │  server actions (mutations)                                  │
  ▼                                                              ▼
src/app/actions/*  ── validation (zod) ── authorization ──► src/lib/db.ts ──► PostgreSQL
                                                                 │            (PGlite locally,
                                                                 │             postgres.js in prod)
                                                                 ▼
                                                          src/db/schema.sql
```

## Layers

### 1. Database — `src/db/`

`schema.sql` is the authoritative definition: idempotent `CREATE TABLE IF NOT EXISTS` statements, indexes, and `ON DELETE` behaviour. It ships with the application as a TypeScript string (`schema.ts`, generated from the SQL file) so a fresh deployment bootstraps itself without a migration tool.

`schema.ts` is generated, not hand-edited:

```bash
node -e 'const fs=require("fs");const sql=fs.readFileSync("src/db/schema.sql","utf8");
fs.writeFileSync("src/db/schema.ts",`// Generated from schema.sql — do not edit.\nexport const SCHEMA_SQL = String.raw\`${sql}\`;\n`)'
```

Running `npm run db:seed` (or any first query) executes the DDL, then seeds. `CREATE TABLE IF NOT EXISTS` makes this safe to repeat.

### 2. Data access — `src/lib/db.ts`

A typed, Prisma-shaped facade. It exposes `db.portfolio.findMany({ where, include, orderBy, take })` and friends, but it is ~950 lines of explicit SQL rather than a code-generated client.

Why a facade and not an ORM:

- **Prisma cannot run here.** Its engine binaries are downloaded from `binaries.prisma.sh` at install/generate time, which is blocked in this build environment. That was discovered by trying it; the migration path is documented below rather than hidden.
- **Drizzle was evaluated and dropped.** It works, but it would add a second schema definition (TypeScript) beside the SQL that actually creates the tables, and the feature set used by this app is small: equality/`in`/`notIn`/range/prefix filters, ordering, includes, counts, CRUD.
- **The surface is deliberately closed.** Identifiers can only come from a static `MODELS` map (table name + camelCase → snake_case columns + timestamp fields). Values are always parameters. A field name from a form can never be interpolated into SQL.

What the facade supports:

| Capability | Notes |
| --- | --- |
| `findMany`, `findFirst`, `findUnique`, `count` | `where` supports equality, `in`, `notIn`, `lt/lte/gt/gte`, `not`, `contains`/`startsWith`/`endsWith`, `AND`, `OR`, `NOT` |
| `create`, `createMany`, `update`, `updateMany`, `upsert`, `delete`, `deleteMany` | Nested `create` is supported only for direct children keyed by `<parent>Id` |
| `include` | Hand-written hydrators for the relations this app renders (portfolio → links, grouped skills, timeline of experience/education, projects → images; project → images; portfolio → user, github, activity, messages; session → user) |
| `$transaction`, `$queryRaw` | Sequential execution on one connection; raw reads are tagged-template only |

Anything outside this table throws instead of silently doing the wrong thing: `QueryError` with `UNKNOWN_FIELD`, `UNSUPPORTED_OPERATOR`, or `P2025` (record not found).

Timestamps come back as `Date` objects via the `dateFields` list per model, so application code never has to remember which columns are dates.

Driver selection is lazy and environment-driven:

- `DATABASE_URL=file:...` or `memory:` → **PGlite** (Postgres in WebAssembly), loaded with `require` so it is never part of a browser bundle.
- `DATABASE_URL=postgres://...` → **postgres.js**, loaded with a dynamic `import()` because that package is ESM-only.

`serverExternalPackages: ["@electric-sql/pglite", "postgres"]` in `next.config.ts` keeps both out of webpack.

**Replacing the facade.** If you later want a full ORM, the blast radius is one file plus `src/lib/rows.ts`: every call site uses the `DbClient`/`ModelApi<T>` types, so implementing the same interface over Prisma or Drizzle requires no route changes. The SQL schema can be imported by either.

### 3. Domain rules — `src/lib`

| File | Responsibility |
| --- | --- |
| `domain.ts` | Project statuses and categories, default sections, completeness scoring, "is this work in progress?" |
| `validation.ts` | Every Zod schema used by forms and actions, including the http(s)-only URL rule |
| `permissions.ts` | Pure authorization predicates (`canManagePortfolio`, `canAdminister`, `canManageMessages`, `assignableRole`) |
| `session.ts` | Session creation, resolution (memoised per request), destruction, pruning |
| `crypto.ts` | scrypt hashing/verification, opaque tokens, SHA-256 token digests |
| `rate-limit.ts` | In-process fixed-window limiter with `clientKey(headers, scope)` |
| `github.ts` | GraphQL-free REST client, mapping, category/status inference, README excerpting |
| `github-sync.ts` | The synchronisation transaction: fetch → match → curate-safe upsert → cache metadata |
| `queries.ts` | Read models for pages (public portfolio, dashboard, admin stats, inbox) |
| `portfolio-view.ts` | Row → view-model mapping used by all four templates **and** the live preview |
| `storage.ts` | Upload validation and writing to `public/uploads/<userId>/` |

### 4. Mutations — `src/app/actions`

Four action modules: `auth`, `portfolio`, `github`, `wizard`. The pattern is uniform:

1. `getCurrentUser()` — memoised per request; unauthenticated actors are redirected, never defaulted.
2. Resolve the target portfolio and check `canManagePortfolio(actor, portfolio)` — owners may edit any portfolio; a user may edit only their own.
3. `schema.safeParse(formData)` — on failure return `ActionResult` with field errors; nothing is written.
4. Perform the write, append an `ActivityLog` row, revalidate the affected paths.
5. Redirect or return `actionOk`.

Actions return `ActionResult` (`{ ok, message, fieldErrors?, data? }`) so forms can render server-side errors without a client state library. Actions that end in a redirect (publish, delete, wizard steps) return `void` and throw Next's redirect signal.

### 5. Rendering — `src/components/portfolio`

`portfolio-view.ts` flattens a portfolio row plus relations into one `PortfolioView`, applying publication rules in the data layer:

- hidden sections are filtered with `visibleSections` semantics; hiding **Contact** also blanks the email address so it cannot leak through the hero or JSON-LD,
- projects must be `published` and not `excluded`, pinned projects first,
- lists are parsed once (`stack`, `features`, `highlights`) into arrays.

`PortfolioRenderer` then switches on a whitelisted template id. Because the switch is a static map, a crafted `template` value cannot resolve an arbitrary component. All four templates are server components with no client JavaScript; the live preview embeds the same components, so what the user previews is exactly what visitors receive.

## Data model

| Table | Purpose | Notable constraints |
| --- | --- | --- |
| `users` | Accounts | unique email, role `USER`/`OWNER`, scrypt hash |
| `sessions` | Session tokens | unique token hash, expiry, cascade on user delete |
| `password_reset_tokens` | One-time reset links | hashed token, `used_at`, expiry |
| `portfolios` | One public page per user | unique slug, template/accent/font/appearance, `published`, `published_at`, JSON section config |
| `social_links`, `skill_groups`, `skills` | Content | skills may be grouped, `learning` flag |
| `experiences`, `education`, `certifications`, `achievements` | Content | JSON-ish list columns (`highlights`, `tech`) |
| `projects` | Projects | unique `(portfolio_id, slug)`, status/progress, `source` github/manual, `excluded`, `readme_note`, GitHub metadata |
| `project_images` | Gallery | cascade on project delete |
| `github_integrations` | Per-portfolio GitHub account | unique portfolio, ETag + rate-limit cache fields |
| `contact_messages` | Inbox | `user_id` set null if the account goes, cascade with portfolio |
| `activity_logs` | Audit trail per portfolio | action + human detail |
| `owner_profiles`, `timeline` | Editorial content for the owner's page | `verified` flag on timeline entries |

Deleting a user cascades to sessions and portfolios; deleting a portfolio cascades to its content. Project deletion cascades to images (verified by test).

## Request lifecycle examples

**Publishing.** Dashboard form → `setPublishedAction` → actor + ownership → `UPDATE portfolios` → `ActivityLog` → `revalidatePath` for `/dashboard`, `/dashboard/preview`, `/u/<slug>`, `/`, `/sitemap.xml` → redirect. `/u/<slug>` is dynamic, so the next request re-reads the row; unpublished portfolios resolve to `notFound()`.

**GitHub sync.** Dashboard button → `syncGithubAction` → rate limit (3/min/user) → `syncGithubForPortfolio` → `GET /users/:login/repos` with `If-None-Match` → 304 short-circuits as "up to date" → otherwise map repos → match existing rows by GitHub id, falling back to normalised repository URL so seeded/curated rows are never duplicated → refresh GitHub-owned fields, preserve human fields → store ETag/rate data → redirect with a summary the UI renders.

**Wizard.** Steps are driven by `?step=N`; each step submits to `wizard.ts`, which validates only that step's fields, writes them, and redirects to the next step. Progress is therefore persisted and survives a refresh; the final step publishes.

## Design decisions

- **No fake data.** The owner portfolio is seeded from the real GitHub account; projects that exist only as ideas are labelled "planned". Statistics on the marketing page are queried, not written.
- **Status is a first-class field.** The six-value vocabulary and `isWorkInProgress` drive badges, progress bars and banners, so "in development" cannot quietly look finished.
- **Server-side authority.** Section visibility, publication and role checks happen in queries/render, never in CSS or client state.
- **One renderer for preview and public.** Removes the class of bugs where the preview lies.
- **Fail closed.** Unknown template → `signal`; unknown status → validation error; missing session → redirect; unknown field in a query → exception.
