import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell title="Reset link missing" subtitle="This page needs a valid reset token.">
        <div className="rounded-xl border border-line bg-surface p-5 text-[13px] leading-relaxed text-muted">
          Password reset links are generated from the{" "}
          <Link href="/forgot-password" className="text-mint hover:text-[#a3e6d8]">
            forgot password
          </Link>{" "}
          page. Request a fresh link and open it again.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="For security, all existing sessions will be signed out.">
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
