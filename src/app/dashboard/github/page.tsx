import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Check, ExternalLink, Github, RefreshCw, Star, X } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Flash } from "@/components/dashboard/flash";
import { Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PROJECT_STATUSES } from "@/lib/domain";
import { monogramGradient } from "@/lib/templates";
import { initials, relativeTime } from "@/lib/utils";
import { syncGithubAction, disconnectGithubAction } from "@/app/actions/github";
import {
  acceptReadmeSuggestionAction,
  dismissReadmeSuggestionAction,
  setProjectStateAction,
  toggleProjectFlagAction,
} from "@/app/actions/portfolio";

export const metadata = { title: "GitHub" };

export default async function GithubPage({
  searchParams,
}: {
  searchParams: Promise<{ sync?: string; syncError?: string; notice?: string; suggestions?: string; remaining?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/github");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  const integration = portfolio.github;
  const imported = portfolio.projects.filter((project) => project.source === "github");
  const suggestions = imported.filter((project) => project.readmeNote);
  const tokenConfigured = Boolean(process.env.GITHUB_TOKEN);
  const rateReset = integration?.rateReset;

  return (
    <div>
      <PageHeader
        eyebrow="Integrations"
        title="GitHub synchronisation"
        description="Repositories are discovered through the official GitHub API, then curated by you. Sync never overwrites descriptions, statuses or progress you have edited."
        action={
          <a href="https://github.com/israeli-dev" target="_blank" rel="noopener noreferrer" className={buttonClasses("ghost", "sm")}>
            <Github className="size-3.5" aria-hidden />
            GitHub profile
            <ExternalLink className="size-3" aria-hidden />
          </a>
        }
      />

      <Flash message={params.sync} />
      {params.syncError && <Flash tone="error" message={params.syncError} />}
      {params.notice && <Flash tone="info" message={params.notice} />}
      {params.suggestions && Number(params.suggestions) > 0 && (
        <Flash
          tone="info"
          message={`${params.suggestions} README-derived description suggestion(s) are waiting for review below. Nothing was published automatically.`}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Github className="size-4 text-text-2" aria-hidden />
                <h2 className="text-[13px] font-medium">Connection</h2>
                <span className={`rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase ${integration ? "border-mint/25 bg-mint/10 text-mint" : "border-line text-muted"}`}>
                  {integration ? "connected" : "not connected"}
                </span>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                {integration
                  ? `Username @${integration.username} · last synced ${integration.lastSyncedAt ? relativeTime(integration.lastSyncedAt) : "never"}`
                  : "Add your GitHub username to discover public repositories."}
              </p>
            </div>
            {integration && (
              <ConfirmForm
                action={disconnectGithubAction}
                title="Disconnect GitHub"
                description="Imported projects stay; the connection and sync state are removed."
                triggerLabel="Disconnect"
                confirmLabel="Disconnect"
              >
                <input type="hidden" name="portfolioId" value={portfolio.id} />
              </ConfirmForm>
            )}
          </div>

          <form action={syncGithubAction} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="portfolioId" value={portfolio.id} />
            <Input
              label="GitHub username"
              name="username"
              defaultValue={integration?.username ?? ""}
              placeholder="octocat"
              className="min-w-[200px] flex-1"
              hint="Public repositories only. Forks and shells like dev-portfolio are skipped."
            />
            <SubmitButton pendingLabel="Syncing…">
              <RefreshCw className="size-3.5" aria-hidden />
              Sync repositories
            </SubmitButton>
          </form>

          {integration?.lastError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[11px] text-danger">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {integration.lastError}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white/[0.02] p-5">
          <h2 className="text-[13px] font-medium">API status</h2>
          <dl className="mt-3 space-y-2.5 text-[11.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Server token</dt>
              <dd className={tokenConfigured ? "text-mint" : "text-sand"}>{tokenConfigured ? "Configured" : "Not set"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Rate limit</dt>
              <dd className="font-mono text-text-2">
                {params.remaining ?? integration?.rateRemaining ?? (tokenConfigured ? "5,000/hr" : "60/hr")}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Resets</dt>
              <dd className="text-text-2">{rateReset ? rateReset.toLocaleTimeString() : "unknown"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Projects imported</dt>
              <dd className="text-text-2">{imported.length}</dd>
            </div>
          </dl>
          <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
            {tokenConfigured
              ? "GITHUB_TOKEN is set server-side. It is never sent to the browser."
              : "Without GITHUB_TOKEN the API allows 60 requests per hour. Add a read-only token in your environment to raise it."}
          </p>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-medium">Suggested descriptions</h2>
              <p className="mt-1 text-[11px] text-muted">
                Extracted from READMEs of repositories with no description. Review before using — these are unverified machine extracts.
              </p>
            </div>
            <span className="font-mono text-[9px] tracking-[0.08em] text-muted uppercase">{suggestions.length} pending</span>
          </div>

          <div className="space-y-2">
            {suggestions.map((project) => (
              <div key={project.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-text">{project.name}</p>
                    <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-muted">{project.readmeNote}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <form action={acceptReadmeSuggestionAction}>
                      <input type="hidden" name="portfolioId" value={portfolio.id} />
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/github" />
                      <SubmitButton variant="secondary" size="sm" pendingLabel="Applying…">
                        <Check className="size-3" aria-hidden />
                        Use
                      </SubmitButton>
                    </form>
                    <form action={dismissReadmeSuggestionAction}>
                      <input type="hidden" name="portfolioId" value={portfolio.id} />
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="redirectTo" value="/dashboard/github" />
                      <SubmitButton variant="ghost" size="sm" pendingLabel="">
                        <X className="size-3" aria-hidden />
                        Dismiss
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-medium">Imported repositories</h2>
            <p className="mt-1 text-[11px] text-muted">Set status and progress accurately. Excluded repositories are skipped on future syncs.</p>
          </div>
          <Link href="/dashboard/projects" className="text-[11px] text-mint hover:text-[#a3e6d8]">
            Open project manager
          </Link>
        </div>

        {imported.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-8 text-center">
            <Github className="mx-auto size-5 text-muted" aria-hidden />
            <p className="mt-3 text-[12.5px] text-text-2">No repositories imported yet</p>
            <p className="mt-1 text-[11px] text-muted">Sync your GitHub account to bring public repositories into the portfolio.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {imported.map((project) => (
              <div key={project.id} className={`rounded-xl border border-line bg-white/[0.02] p-4 ${project.excluded ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-medium text-white/80" style={{ background: monogramGradient(project.name) }}>
                      {initials(project.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12.5px] font-medium text-text">{project.name}</p>
                        <StatusBadge status={project.status} size="sm" />
                        {project.featured && <Star className="size-3 fill-sand text-sand" aria-hidden />}
                        {project.excluded && <span className="font-mono text-[8.5px] text-danger uppercase">excluded</span>}
                      </div>
                      <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-muted">{project.tagline || "No description"}</p>
                      <p className="mt-1 font-mono text-[9px] text-muted/70">
                        {project.repoName}
                        {project.language ? ` · ${project.language}` : ""}
                        {project.lastPushedAt ? ` · pushed ${relativeTime(project.lastPushedAt)}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses("ghost", "sm")}>
                        Repo
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    )}
                    <Link href={`/dashboard/projects/${project.id}`} className={buttonClasses("ghost", "sm")}>
                      Edit
                    </Link>
                    <form action={toggleProjectFlagAction}>
                      <input type="hidden" name="portfolioId" value={portfolio.id} />
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="field" value="featured" />
                      <input type="hidden" name="redirectTo" value="/dashboard/github" />
                      <SubmitButton variant={project.featured ? "secondary" : "ghost"} size="sm" pendingLabel="">
                        <Star className={`size-3 ${project.featured ? "fill-sand text-sand" : ""}`} aria-hidden />
                        {project.featured ? "Pinned" : "Pin"}
                      </SubmitButton>
                    </form>
                  </div>
                </div>

                <form action={setProjectStateAction} className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
                  <input type="hidden" name="portfolioId" value={portfolio.id} />
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="redirectTo" value="/dashboard/github" />
                  <Select label="Status" name="status" defaultValue={project.status} className="min-w-[150px] flex-1">
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </Select>
                  <Input
                    label="Progress %"
                    name="progress"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={project.progress ?? ""}
                    className="w-[110px]"
                  />
                  <div className="flex items-center gap-2 pb-0.5">
                    <label className="flex items-center gap-1.5 text-[11px] text-muted">
                      <input type="checkbox" name="exclude" value="true" defaultChecked={project.excluded} className="size-3.5 accent-[#FF7A6B]" />
                      Exclude
                    </label>
                    <SubmitButton size="sm" variant="secondary" pendingLabel="Saving…">Update</SubmitButton>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 max-w-3xl text-[10.5px] leading-relaxed text-muted">
        Sync policy: repository names, URLs, languages, stars, forks and last-push dates are refreshed on every sync.
        Taglines, statuses, categories, progress and demo URLs are only filled when empty, so curation is never overwritten.
        To edit a synced project in full, use the project editor.
      </p>
    </div>
  );
}
