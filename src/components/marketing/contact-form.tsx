"use client";

import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input, Textarea } from "@/components/ui/field";
import { submitContactAction } from "@/app/actions/contact";
import type { ActionResult } from "@/lib/action-result";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function ContactForm() {
  return (
    <ActionForm action={submitContactAction as Action} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Your name" name="name" autoComplete="name" placeholder="Ada Lovelace" required />
        <Input label="Email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </div>
      <Input label="Subject" name="subject" placeholder="Role, project or collaboration" />
      <Textarea
        label="Message"
        name="message"
        rows={6}
        placeholder="What are you building, and where would I fit?"
        hint="Minimum 20 characters. Be specific — it gets a better reply."
        required
      />

      {/* Honeypot — hidden from assistive tech and real users. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="max-w-[260px] text-[11px] leading-relaxed text-muted">
          Messages are stored in this application&apos;s inbox. No newsletter, no third-party tracking.
        </p>
        <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
      </div>
    </ActionForm>
  );
}
