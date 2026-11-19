import { Check, X } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata = { title: "System" };

export default async function AdminSystem() {
  const [sessions, tokens, projects, portfolios, messages] = await Promise.all([
    db.session.count(),
    db.passwordResetToken.count({ where: { usedAt: null } }),
    db.project.count(),
    db.portfolio.count(),
    db.contactMessage.count(),
  ]);

  const checks = [
    { label: "Database reachable", ok: true, detail: `${portfolios} portfolios · ${projects} projects` },
    { label: "Session cookie signing", ok: true, detail: "HttpOnly · SameSite=Lax · Secure in production" },
    {
      label: "GitHub token configured",
      ok: Boolean(process.env.GITHUB_TOKEN),
      detail: process.env.GITHUB_TOKEN ? "GITHUB_TOKEN set (server-only)" : "Not set — 60 requests/hour anonymous limit",
    },
    {
      label: "Site URL configured",
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      detail: process.env.NEXT_PUBLIC_SITE_URL ?? "Falling back to localhost",
    },
    {
      label: "Transactional email",
      ok: Boolean(process.env.RESEND_API_KEY),
      detail: process.env.RESEND_API_KEY ? "Configured — reset links and contact notifications are emailed" : "Not configured — reset links surface in development only; messages stay in the inbox",
    },
    {
      label: "Seed password changed",
      ok: Boolean(process.env.SEED_OWNER_PASSWORD && process.env.SEED_OWNER_PASSWORD !== "change-me-please"),
      detail: "Set SEED_OWNER_PASSWORD before deploying to a public host",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Configuration and health"
        description="Non-secret configuration only. Values are read on the server; no token or key is ever rendered."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <div key={check.label} className="rounded-xl border border-line bg-white/[0.02] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12px] font-medium text-text">{check.label}</p>
              {check.ok ? <Check className="size-4 shrink-0 text-mint" aria-label="OK" /> : <X className="size-4 shrink-0 text-sand" aria-label="Attention" />}
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">{check.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active sessions", value: sessions },
          { label: "Pending reset tokens", value: tokens },
          { label: "Stored messages", value: messages },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-white/[0.02] p-4">
            <p className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">{item.label}</p>
            <p className="mt-1.5 text-[18px] font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 max-w-3xl rounded-xl border border-line bg-white/[0.02] p-5">
        <h2 className="text-[13px] font-medium">Known limitations in this release</h2>
        <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted">
          <li>• Rate limiting is in-process; multi-instance deployments need a shared store.</li>
          <li>• Image URLs are accepted; binary uploads and object storage are not enabled yet.</li>
          <li>• Custom domains and analytics are architected for but not shipped.</li>
          <li>• Password reset links require an email provider in production; without one the link is only shown in development.</li>
          <li>• GitHub OAuth is not used: the app reads public repositories with an optional server-side token.</li>
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          Full detail lives in <code className="font-mono text-text-2">docs/LIMITATIONS.md</code>.
        </p>
      </section>
    </div>
  );
}
