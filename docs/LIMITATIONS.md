# Known limitations

Written down rather than hidden. Each item states the current behaviour, the risk, and the concrete next step.

## Data layer

1. **PGlite is local-only and single-process.**
   *Current:* locally the database is a directory opened by one Node process. Writing to it from a second process (seed, CLI sync, a `psql` session) while the dev server runs does not make the write visible to the server until it restarts, and concurrent writes are unsafe.
   *Impact:* development only. `README.md` tells you to stop the server before `db:seed` / `db:reset` / `sync:github`.
   *Next step:* use managed Postgres in production (required on Vercel); optionally a local Postgres container for multi-process development.

2. **The `postgres://` driver is not exercised in this environment.**
   *Current:* `createPostgresDriver` uses `postgres.js` and the same parameterised SQL.
   *Risk:* connection-string options, SSL and pool sizing are unverified here because no external Postgres was reachable from the build sandbox.
   *Next step:* run the suite once against a real database (`DATABASE_URL=postgres://… npm test`) in CI; the harness already isolates per test.

3. **No migration history.**
   *Current:* `schema.sql` uses idempotent DDL applied at boot; additive changes are safe, destructive changes need manual statements.
   *Risk:* no down-migrations and no per-environment audit trail.
   *Next step:* adopt Atlas or node-pg-migrate, keeping `schema.sql` as the target state.

4. **The query facade covers only what the app uses.**
   *Current:* no `groupBy`, aggregates, nested writes beyond direct children, or cursor pagination.
   *Risk:* new features may need facade work before they can be written declaratively.
   *Next step:* extend `buildWhere`/`hydrate`, or swap in an ORM behind the `DbClient` interface (one file + `rows.ts`).

## Platform features

5. **One portfolio per account.**
   *The schema allows many (unique slug per row) and the dashboard uses the oldest, but there is no UI to create a second portfolio. Multi-portfolio is a deliberate post-MVP cut, not a hidden feature.*

6. **No custom domains, no subdomain routing.**
   *Public pages live at `/u/<handle>`. Adding `handle.folio.app` needs wildcard DNS plus a host-based lookup in `src/app/u/[slug]/page.tsx`.*

7. **Uploads are written to local disk.**
   *`public/uploads/<userId>/<uuid>.<ext>`, 2 MB, magic-byte checked, SVG rejected. On serverless hosting the filesystem is read-only, so the endpoint answers 501 and asks for an image URL instead of failing opaquely; replace `src/lib/storage.ts` with S3/R2 to enable uploads there. Images are not resized or re-encoded.*

8. **Email delivery is optional and has no retry queue.**
   *Without `RESEND_API_KEY`, password-reset links are surfaced in the UI in development and contact messages stay in `/dashboard/inbox`. With the key set, reset links and contact notifications are sent through Resend (`src/lib/mail.ts`). Delivery is fire-and-forget: failures are logged and never block the database write, but there is no retry queue, delivery log or bounce handling.*

9. **Rate limiting is per process, in memory.**
   *Fine for a single instance; a multi-replica deployment multiplies the effective limit. Swap `src/lib/rate-limit.ts` for Upstash/Redis or a Postgres table.*

10. **No billing.**
    *Everything is free and unlimited by design for the MVP. The brief explicitly deferred billing; adding it means plans, entitlement checks in publishing/upload routes, and a webhook handler.*

11. **GitHub integration imports public repositories only.**
    *Private repos are filtered out. The token is read-only and optional; without it you get 60 requests/hour, and the UI surfaces a rate-limit message instead of failing silently. Sync is manual (button or CLI), not scheduled — add a cron job calling `syncGithubForPortfolio` for each connected portfolio if you want freshness.*

12. **Templates are fixed at four.**
    *Adding one means a component in `src/components/portfolio/`, an entry in `RENDERERS`, the `appearanceSchema` enum and the `/templates` gallery. There is no user-authored template/HTML injection, which is deliberate (XSS surface).*

13. **No analytics and no tracking pixels.**
    *Deliberately absent. The brief rejected fabricated statistics; if you add real analytics, keep it consent-aware and out of the public template markup.*

## Quality gaps and next steps

14. **Browser-level tests are missing.**
    *Auth, CRUD, publishing and rendering are covered by 108 integration tests against a real database, but keyboard navigation, focus management in dialogs, and responsive layout are not automated. No headless browser was available while building this; the next step is Playwright covering signup → wizard → publish → public page, plus an axe accessibility pass.*

15. **No two-factor authentication or social login.**
    *Email + password with scrypt. TOTP and OAuth (GitHub, Google) are the natural additions; both fit the existing `users`/`sessions` model.*

16. **No content moderation or abuse controls beyond rate limits.**
    *Anyone can sign up and publish. Before opening registration publicly you would want email verification, a report link, and an admin takedown action.*

17. **Accessibility is implemented but not audited.**
    *Semantic landmarks, visible focus rings, labelled inputs, skip link, and dialogs that trap focus with `aria-modal` are in place. Contrast ratios and screen-reader announcements have not been verified with assistive technology.*

18. **Images from project galleries are stored as URLs.**
    *The seed uses three real PetroLens screenshots pulled from its repository. There is no image pipeline (responsive `srcset`, AVIF) beyond Next's image component defaults.*

19. **Owner identity content is partially static.**
    *The hero identity, "currently learning" list and editorial narrative come from `src/content/personal.ts`; projects, skills, experience, education and timeline come from the database. That split is intentional (editorial copy stays reviewable in git) but means changing the narrative requires a deploy.*
