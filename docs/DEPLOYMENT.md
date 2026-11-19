# Deployment

## Deploy to Vercel in six steps

Folio runs on Vercel **if the database is a managed Postgres**. The local PGlite
directory does not survive a serverless deploy (read-only filesystem, ephemeral
per invocation), so the one hard requirement is a `postgres://` URL.

1. **Create the database.** Vercel Postgres/Neon, Supabase or any Postgres 14+
   instance. Copy the connection string; keep `?sslmode=require` on it — the
   driver reads it directly.
2. **Import the repository.** Vercel → *Add New → Project* → pick
   `israeli-dev/dev-portfolio`, branch `arena/db32c41c-dev-portfolio` (or `main`
   once merged). Framework preset: **Next.js**, root directory `./`, install
   `npm install`, build `npm run build`. No `vercel.json` is required.
3. **Set environment variables** (Production *and* Preview):

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | `postgres://user:pass@host/db?sslmode=require` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (or your domain) |
   | `SEED_OWNER_EMAIL` | `owner@folio.local` |
   | `SEED_OWNER_PASSWORD` | a strong password you choose |
   | `GITHUB_TOKEN` | optional, read-only public-repo token |
   | `RESEND_API_KEY` / `EMAIL_FROM` | optional, for reset links and contact email |

   Without `NEXT_PUBLIC_SITE_URL` the app falls back to Vercel's own host, so
   preview URLs still produce correct canonical links and OG tags.
4. **Deploy.** The schema is created on the first query, and `/sitemap.xml`
   tolerates a cold database, so the build does not depend on a seeded DB.
5. **Seed once, from your machine** (not from Vercel — builds must not write
   content):

   ```bash
   DATABASE_URL="postgres://…?sslmode=require" \
   SEED_OWNER_EMAIL="owner@folio.local" \
   SEED_OWNER_PASSWORD="your-strong-password" \
   npm run db:seed

   DATABASE_URL="postgres://…?sslmode=require" npm run sync:github -- israeli-dev israel-kolawole
   ```

6. **Verify.** `https://your-project.vercel.app/api/health` should report
   `"database":"reachable"`. Sign in at `/login`, confirm `/u/israel-kolawole`
   renders, and publish/unpublish once.

### What is different on Vercel

| Area | Behaviour |
| --- | --- |
| Database | Must be managed Postgres. PGlite is local-only. |
| Uploads | The filesystem is read-only, so `/api/uploads` returns **501** with a clear message. Paste an image URL (project `imageUrl`, avatar, cover) instead, or point `src/lib/storage.ts` at S3/R2. Everything else — publishing, editing, GitHub sync — is unaffected. |
| Schema bootstrap | `CREATE TABLE IF NOT EXISTS` runs once per cold start. Harmless, but run `npm run db:schema` against the database once and keep an eye on cold-start latency. |
| Rate limiting | In-memory, therefore per instance. Fine for a portfolio; back it with Redis if you open public signups at scale. |
| Email | Optional. Without `RESEND_API_KEY`, reset links appear in the UI only in development; on Vercel (production) configure the key or reset passwords from the seed/CLI. |
| Region | Put the function in the same region as the database (Vercel → Settings → Functions) to avoid cross-continent query latency. |


## 1. Environment variables

Copy `.env.example` and fill it in. Nothing in this repository contains a real secret.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `postgres://user:pass@host/db` in production. `file:.data/pglite` for local development. |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Absolute origin used for canonical URLs, sitemap entries and OG metadata. |
| `GITHUB_TOKEN` | optional | Read-only fine-grained token for public repositories. Raises the API limit from 60 to 5,000 requests/hour. Server-side only. |
| `GITHUB_USERNAME` | optional | Default account used by the seed and CLI sync (`israeli-dev`). |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` / `SEED_OWNER_NAME` | optional | Owner account created by `npm run db:seed`. Change the password before exposing the site. |
| `RESEND_API_KEY` | optional | Enables outbound email for contact notifications and password reset links. |
| `CONTACT_TO_EMAIL` | optional | Destination for contact notifications; defaults to the owner's account email. |

Never commit `.env`. `.gitignore` already excludes it and the local `.data/` directory.

## 2. Database

### Option A — managed Postgres (recommended)

Vercel Postgres/Neon, Supabase, Railway, RDS and Fly Postgres all work; any PostgreSQL 14+ instance is fine. Set `DATABASE_URL` to the pooled or direct connection string.

```bash
# One-time schema creation (also happens automatically on first query)
psql "$DATABASE_URL" -f src/db/schema.sql

# Seed the owner portfolio + editorial content
npm run db:seed

# Import the owner's repositories through the real GitHub API
NODE_EXTRA_CA_CERTS= npm run sync:github -- israeli-dev israel-kolawole
```

`npm run db:seed` is idempotent: it updates the owner account and upserts the portfolio and content rather than duplicating them. Run it again after changing seed content.

### Option B — no database server

PGlite persists to a directory: `DATABASE_URL="file:.data/pglite"`. This is ideal for demos and self-hosting on a single VM with a persistent volume. It is **not** suitable for serverless platforms where the filesystem is ephemeral or shared by concurrent instances, and only one process may open the directory at a time.

### Schema changes

There is no migration runner. The schema is applied with `CREATE TABLE IF NOT EXISTS` at boot, which covers first installs and additive changes made by editing `schema.sql`.

For a destructive/altering change on a live database:

1. Add an idempotent statement to `src/db/schema.sql` (for example `ALTER TABLE projects ADD COLUMN IF NOT EXISTS ...`).
2. Regenerate `src/db/schema.ts` (command in `docs/ARCHITECTURE.md`).
3. Apply it with `psql "$DATABASE_URL" -f src/db/schema.sql`.
4. Deploy the code that uses the new column.

If you adopt a migration tool later (Drizzle Kit, Atlas, node-pg-migrate), keep `schema.sql` as the target state and generate migrations from it.

### Backups

- Managed Postgres: enable automated daily backups and point-in-time recovery.
- PGlite: stop the app and copy `.data/pglite` (it is a directory-backed Postgres). Treat the copy as a database dump, not as source code.

## 3. Build and run

```bash
npm ci
npm run typecheck
npm test
npm run build
npm start          # honours PORT, defaults to 3000
```

The build must have a reachable database: several routes read during prerender/validation. Run `db:seed` (or at least apply `schema.sql`) before `npm run build` in CI.

### Platform notes

**Vercel / Netlify / serverless**
- Use managed Postgres (PGlite's directory will not survive between invocations).
- Uploaded images are written to `public/uploads/`: on serverless the filesystem is read-only/ephemeral. Switch `src/lib/storage.ts` to S3/R2/Cloudinary before enabling uploads in production.
- In-process rate limits are per instance. For multi-region deployments back `src/lib/rate-limit.ts` with Upstash Redis or a Postgres table.

**Docker / single VM**
- PGlite is a valid choice if the container has a persistent volume mounted at `.data/`.
- Set `NEXT_PUBLIC_SITE_URL` to the public origin so OG tags and sitemap entries are absolute.

**Reverse proxy**
- Terminate TLS at the proxy and forward `X-Forwarded-For`; the rate limiter keys on it.
- The app already sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`. For a Content-Security-Policy, see `docs/SECURITY.md` — apply it at the proxy so you can use nonces per request.

## 4. Post-deploy checklist

```bash
curl -s https://your-domain/api/health
# {"status":"ok","database":"reachable","githubToken":true,...}

curl -sI https://your-domain/ | head -8          # security headers present
curl -s -o /dev/null -w "%{http_code}\n" https://your-domain/u/israel-kolawole   # 200 when published
curl -s -o /dev/null -w "%{http_code}\n" https://your-domain/admin              # 307 → /login
```

Then sign in as the owner and confirm: dashboard loads, publishing toggles the public page, a GitHub sync completes, and a contact message appears in `/dashboard/inbox`.

## 5. Rotating secrets

- **Owner password:** change it in `/dashboard/settings`; all sessions are revoked. Then update `SEED_OWNER_PASSWORD` in your secret store so a future seed does not reset it to the old value.
- **GitHub token:** revoke it in GitHub, issue a new one, redeploy. No data depends on the token itself.
- **Reset tokens:** stored as SHA-256 hashes, single use, 30-minute TTL, deleted on successful reset.
