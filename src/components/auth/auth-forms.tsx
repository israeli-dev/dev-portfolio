"use client";

import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/field";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "@/app/actions/auth";
import type { ActionResult } from "@/lib/action-result";

type Action = (state: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;

export function LoginForm({ next }: { next?: string }) {
  return (
    <ActionForm action={signInAction as Action} noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <Input label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <div>
        <Input label="Password" name="password" type="password" autoComplete="current-password" placeholder="••••••••••" required />
        <div className="mt-2 text-right">
          <Link href="/forgot-password" className="text-[11.5px] text-muted transition-colors hover:text-text">
            Forgot your password?
          </Link>
        </div>
      </div>
      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
    </ActionForm>
  );
}

export function SignUpForm() {
  return (
    <ActionForm action={signUpAction as Action} noValidate>
      <Input label="Full name" name="name" autoComplete="name" placeholder="Ada Lovelace" required />
      <Input label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 10 characters"
        hint="Minimum 10 characters, including a letter and a number."
        required
      />
      <SubmitButton pendingLabel="Creating account…" className="w-full">
        Create free account
      </SubmitButton>
      <p className="text-[11px] leading-relaxed text-muted">
        By creating an account you agree to publish only accurate professional information. Your portfolio stays private
        until you publish it.
      </p>
    </ActionForm>
  );
}

export function ForgotPasswordForm() {
  return (
    <ActionForm action={requestPasswordResetAction as Action} noValidate>
      <Input label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      <SubmitButton pendingLabel="Checking…" className="w-full">
        Create reset link
      </SubmitButton>
      <p className="block text-[11.5px] text-mint">
        <Link href="/login">Return to sign in</Link>
      </p>
    </ActionForm>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  return (
    <ActionForm action={resetPasswordAction as Action} noValidate>
      <input type="hidden" name="token" value={token} />
      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Minimum 10 characters, including a letter and a number."
        required
      />
      <Input label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
      <SubmitButton pendingLabel="Updating…" className="w-full">
        Set new password
      </SubmitButton>
    </ActionForm>
  );
}
