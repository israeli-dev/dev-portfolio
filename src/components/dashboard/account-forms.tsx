"use client";

import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/field";
import { changePasswordAction, updateAccountAction, updateSlugAction } from "@/app/actions/portfolio";
import type { ActionResult } from "@/lib/action-result";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function AccountForm({ name, email }: { name: string; email: string }) {
  return (
    <ActionForm action={updateAccountAction as Action} noValidate>
      <Input label="Your name" name="name" defaultValue={name} required />
      <Input label="Email" name="email" defaultValue={email} disabled hint="Email changes require verification — not enabled in this release." />
      <div className="flex justify-end">
        <SubmitButton size="sm" pendingLabel="Saving…">Save account</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={changePasswordAction as Action} noValidate>
      <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
      <Input label="New password" name="newPassword" type="password" autoComplete="new-password" required hint="At least 10 characters with a letter and a number." />
      <Input label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required />
      <div className="flex justify-end">
        <SubmitButton size="sm" variant="secondary" pendingLabel="Updating…">Change password</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function SlugForm({ slug }: { slug: string }) {
  return (
    <ActionForm action={updateSlugAction as Action} noValidate>
      <Input
        label="Public handle"
        name="slug"
        defaultValue={slug}
        required
        hint="Lowercase letters, numbers and hyphens. Changing this breaks old links."
      />
      <div className="flex justify-end">
        <SubmitButton size="sm" variant="secondary" pendingLabel="Updating…">Update URL</SubmitButton>
      </div>
    </ActionForm>
  );
}
