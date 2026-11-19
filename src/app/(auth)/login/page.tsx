import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to manage and publish your portfolio." };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; verified?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to edit your portfolio, review GitHub sync results and publish changes."
      footer={
        <p>
          New here?{" "}
          <Link href="/signup" className="text-mint hover:text-[#a3e6d8]">
            Create a free account
          </Link>
          .
        </p>
      }
    >
      {params.reset === "1" && (
        <div role="status" className="mb-5 rounded-[10px] border border-mint/25 bg-mint/[0.07] px-3.5 py-3 text-[12.5px] text-mint">
          Password updated. Sign in with your new password.
        </div>
      )}
      <LoginForm next={params.next} />
    </AuthShell>
  );
}
