# Testing

## Running

```bash
npm test          # 97 tests, ~12 s
npm run test:watch
npm run typecheck # includes tests/ and tests/**/*.tsx
```

No database server, browser or network access is required. Tests run against **PGlite in memory**, so the schema, SQL, constraints and cascade behaviour are the production ones.

## How the harness works

| Piece | File | Why |
| --- | --- | --- |
| Database | `tests/setup.ts` | Sets `DATABASE_URL=memory:` before any app module loads. `singleFork` keeps one PGlite instance per run. |
| Request context | `tests/setup.ts` + `tests/support/request.ts` | `vi.mock` replaces `next/headers`, `next/cache` and `next/navigation` with an in-memory cookie jar, a no-op revalidation and a throwing redirect — the same semantics Next gives server actions. |
| Real sign-in | `tests/support/request.ts` | `signInAs(user)` inserts a genuine `sessions` row and puts a genuine token in the cookie jar, so `getCurrentUser()` is exercised end to end rather than mocked. |
| Isolation | `tests/support/fixtures.ts` | `resetDatabase()` deletes every table children-first and `resetRequest()` clears cookies and rate-limit buckets before each test. |
| Fixtures | `createAccount`, `createProject`, `form()` | Build users/portfolios/projects through the data layer, and `FormData` payloads the way a browser would submit them. |

Because the actions themselves are imported, tests cover validation → authorization → SQL → redirect. Only the framework primitives are stubbed.

## Coverage

**`tests/auth.test.ts` — 20 tests**
- scrypt hash format, salting, verification, wrong-password rejection.
- Sign-up creates a user, an unpublished draft, and a session; duplicate email and weak passwords are refused without writes; a crafted `role=OWNER` field is ignored; identical names produce distinct handles.
- Sign-in: generic failure message for both unknown email and wrong password (no account enumeration); owner lands on `/admin`, member on `/dashboard`; sign-out deletes the session row and cookie.
- Password reset: generic response for unknown addresses, single-use token, hashed password replaced, all sessions revoked, expired and reused tokens refused, mismatched confirmation stopped before any write.
- Route guards: anonymous → `/login`, member blocked from admin, owner admitted.

**Authorization — covered inside `validation.test.ts` and `isolation.test.ts`**
- Pure predicates for ownership, admin, message moderation, publication and section visibility.
- `assignableRole` never returns `OWNER`; `safeRedirectPath` blocks `//evil.example` and absolute URLs.

**`tests/portfolio.test.ts` — 16 tests**
- Profile update persists fields and writes an `ActivityLog`; invalid input returns field errors and writes nothing.
- Handle change, duplicate-handle conflict, invalid handle.
- Appearance: template/accent/font/theme saved together; unknown template rejected.
- Section visibility persisted server-side and missing sections restored.
- Skills: group created on demand, duplicate names are a no-op.
- Projects: create from form, slug de-duplication (`bado`, `bado-2`), invalid status rejected, cross-account project id cannot be edited, flags toggled only for allowed fields, progress clamped to 0–100, delete cascades to gallery images.

**`tests/publishing.test.ts` — 8 tests**
- Publish stamps `published_at` and logs; unpublish keeps the original date.
- Public query returns `null` for drafts, the row when published; the dashboard may load drafts explicitly.
- Public statistics count only published, non-excluded projects.
- View model drops hidden sections, unpublished and excluded projects; puts pinned projects first; keeps `in-development`/progress values intact.
- Dashboard scoping returns each user only their own portfolio.

**`tests/isolation.test.ts` — 7 tests**
- A member cannot mutate another member's portfolio even with a valid `portfolioId`; the platform owner can, deliberately.
- Every mutating action requires a session.
- Contact messages can only be read/marked/deleted by their recipient or the owner.
- GitHub connections are per portfolio; sync without a session redirects to login.

**`tests/rendering.test.tsx` — 6 tests**
- All four templates render real database-backed data without throwing.
- Project names, taglines and the honest "in development" label plus progress appear in the HTML.
- A hidden section removes its content from the markup (not just CSS); hiding Contact also withholds the email.
- The renderer respects the stored template; unpublished slugs do not resolve publicly.
- User-supplied `<script>` is escaped rather than injected.

**`tests/github.test.ts` — 9 tests**

**`tests/mail.test.ts` — 5 tests**
- No provider → reported cleanly, `fetch` never called.
- Configured → POSTs to Resend with the key in an `Authorization` header, key absent from the body.
- Provider rejection and network failure degrade to `{ sent: false }` instead of throwing into the form handler.
- Invalid recipient rejected before any request.
- Status inference never returns `completed`; homepage must be http(s) to count as live.
- Private and shell repositories are filtered; handles normalise and reject junk.
- Mapping uses real language data (max four languages), categories, slugs, and README excerpting strips badges/headings.

**`tests/validation.test.ts` — 26 tests**
- Email normalisation, password policy, sign-up requirements.
- Profile defaults and optional email; template whitelist; accent hex format.
- Project schema: status whitelist, progress bounds, http(s)-only links, slug shape.
- Contact form: length rules, honeypot.
- Handle rules.
- Completeness weights (sum to 100, 0% empty, 100% complete), sections merge/order, work-in-progress flag, section filtering, role escalation, open redirects, slug/date helpers.

## What was verified manually

Run in this checkout on 2026-11-19:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors (app + tests) |
| `npm run db:reset` | schema created, owner `owner@folio.local`, portfolio `/u/israel-kolawole`, 9 projects, 26 skills, 4 timeline entries |
| `npm run build` | success, 28 routes compiled |
| `npm start` (port 3100) | `/`, `/projects`, `/templates`, `/u/israel-kolawole`, `/api/health` all 200 |
| Unauthenticated `/dashboard*`, `/admin*` | 307 to `/login?next=…` |
| Authenticated dashboard/admin pages | all 14 routes 200 with a real session cookie |
| `GET /api/health` | `{"status":"ok","database":"reachable","githubToken":true}` |
| Real GitHub sync (`sync:github`) | 8 repositories refreshed, 0 duplicates created, ETag/rate data stored (rate remaining 4,935) |
| Second sync immediately after | matched existing rows by GitHub id/URL; no new projects |

## Not covered by automated tests

- Browser behaviour: keyboard traversal, focus traps in dialogs, responsive breakpoints, colour contrast. No headless browser was available in the build sandbox; these were reviewed in code and must be verified in a real browser.
- The `postgres://` driver path: no external Postgres was reachable. The SQL is standard Postgres and PGlite shares the dialect, but connection pooling and SSL parameters are untested here.
- Email delivery via Resend, and image upload writes to disk (validation logic is covered by code review; the route requires a real multipart request to exercise).
- Rate limiter behaviour under concurrency and across multiple instances.

Add `@playwright/test` for the browser layer when leaving the MVP: the seeded owner account and the stable `data-testid`-free accessible names make the flows straightforward to script.
