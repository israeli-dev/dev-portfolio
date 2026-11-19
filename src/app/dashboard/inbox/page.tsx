import { redirect } from "next/navigation";
import { Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getOwnerInbox, getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Flash } from "@/components/dashboard/flash";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClasses } from "@/components/ui/button";
import { relativeTime } from "@/lib/utils";
import { deleteMessageAction, markMessageReadAction } from "@/app/actions/portfolio";

export const metadata = { title: "Inbox" };

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/inbox");

  const [portfolio, messages] = await Promise.all([getPortfolioForUser(user.id), getOwnerInbox(user.id)]);
  const unread = messages.filter((message) => !message.read).length;

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Contact messages"
        description={`Every submission from your public contact form is stored here. ${unread} unread.`}
        action={
          <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] text-muted uppercase">
            {messages.length} total
          </span>
        }
      />

      {params.denied && <Flash tone="error" message="You do not have access to that message." />}

      {messages.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-4" aria-hidden />}
          title="No messages yet"
          description="When someone submits the contact form on your public portfolio, it arrives here — no email provider required."
          action={portfolio ? <a href={`/u/${portfolio.slug}`} className={buttonClasses("secondary", "sm")}>Open public page</a> : undefined}
        />
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-xl border p-4 ${message.read ? "border-line bg-white/[0.015]" : "border-mint/25 bg-mint/[0.03]"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12.5px] font-medium text-text">{message.name}</p>
                    {!message.read && (
                      <span className="rounded-full bg-mint/15 px-1.5 py-0.5 font-mono text-[8.5px] tracking-[0.08em] text-mint uppercase">new</span>
                    )}
                    <span className="font-mono text-[9px] text-muted">{relativeTime(message.createdAt)}</span>
                  </div>
                  <a href={`mailto:${message.email}`} className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted hover:text-mint">
                    <Mail className="size-3" aria-hidden />
                    {message.email}
                  </a>
                  {message.subject && <p className="mt-2 text-[11.5px] font-medium text-text-2">{message.subject}</p>}
                  <p className="mt-1.5 max-w-3xl whitespace-pre-line text-[11.5px] leading-relaxed text-muted">{message.message}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <form action={markMessageReadAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                    <input type="hidden" name="redirectTo" value="/dashboard/inbox" />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="">
                      {message.read ? <Mail className="size-3.5" aria-hidden /> : <MailOpen className="size-3.5" aria-hidden />}
                      {message.read ? "Unread" : "Read"}
                    </SubmitButton>
                  </form>
                  <form action={deleteMessageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="redirectTo" value="/dashboard/inbox" />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="">
                      <Trash2 className="size-3.5" aria-hidden />
                      <span className="sr-only">Delete</span>
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-6 text-[10.5px] leading-relaxed text-muted">
        Messages are stored in the database only. Configure an email provider (see docs/DEPLOYMENT.md) to also receive them
        by email — the form continues to work either way.
      </p>
    </div>
  );
}
