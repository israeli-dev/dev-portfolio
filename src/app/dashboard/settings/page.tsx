import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Flash } from "@/components/dashboard/flash";
import { AccountForm, PasswordForm, SlugForm } from "@/components/dashboard/account-forms";
import { SubmitButton } from "@/components/ui/submit-button";
import { CopyButton } from "@/components/ui/copy-button";
import { deleteAccountAction, setPublishedAction } from "@/app/actions/portfolio";
import { buttonClasses } from "@/components/ui/button";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/settings");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Account and publication"
        description="Your public URL, publication state, account details and password."
      />

      {params.error && <Flash tone="error" message={params.error} />}
      {params.saved && <Flash message="Saved." />}

      <section className="max-w-2xl rounded-xl border border-line bg-white/[0.015] p-5">
        <h2 className="text-[14px] font-medium">Publication</h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          {portfolio.published
            ? "Your portfolio is live. Unpublishing makes it return 404 for everyone except you."
            : "Your portfolio is a private draft. Publish it to make it readable at the URL below."}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-ink px-3.5 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Public URL</p>
            <p className="mt-1 truncate font-mono text-[12px] text-text-2">/u/{portfolio.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {portfolio.published && (
              <>
                <CopyButton value={`/u/${portfolio.slug}`} label="Copy" />
                <Link href={`/u/${portfolio.slug}`} className={buttonClasses("ghost", "sm")}>
                  Open
                  <ExternalLink className="size-3" aria-hidden />
                </Link>
              </>
            )}
            <form action={setPublishedAction}>
              <input type="hidden" name="portfolioId" value={portfolio.id} />
              <input type="hidden" name="published" value={portfolio.published ? "false" : "true"} />
              <input type="hidden" name="redirectTo" value="/dashboard/settings" />
              <SubmitButton
                size="sm"
                variant={portfolio.published ? "danger" : "primary"}
                pendingLabel={portfolio.published ? "Unpublishing…" : "Publishing…"}
              >
                {portfolio.published ? "Unpublish" : "Publish"}
              </SubmitButton>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-white/[0.015] p-5">
        <h2 className="mb-4 text-[14px] font-medium">Account</h2>
        <AccountForm name={user.name} email={user.email} />
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-white/[0.015] p-5">
        <h2 className="text-[14px] font-medium">Public handle</h2>
        <p className="mt-1 mb-4 text-[11.5px] leading-relaxed text-muted">
          Used in your published URL. Custom domains are on the roadmap, not in this release.
        </p>
        <SlugForm slug={portfolio.slug} />
      </section>

      <section className="max-w-2xl rounded-xl border border-line bg-white/[0.015] p-5">
        <h2 className="mb-4 text-[14px] font-medium">Password</h2>
        <PasswordForm />
      </section>

      <section className="max-w-2xl rounded-xl border border-danger/25 bg-danger/[0.04] p-5">
        <h2 className="flex items-center gap-2 text-[14px] font-medium text-danger">
          <ShieldAlert className="size-4" aria-hidden />
          Delete account
        </h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          Permanently deletes your account, portfolio, projects and uploaded records. This cannot be undone. Type your email
          to confirm.
        </p>
        <form action={deleteAccountAction} className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="email"
            name="confirmEmail"
            required
            placeholder={user.email}
            className="field max-w-[280px]"
            aria-label="Confirm your email address"
          />
          <SubmitButton variant="danger" size="sm" pendingLabel="Deleting…">
            Delete permanently
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
