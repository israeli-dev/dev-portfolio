import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Create your portfolio",
  description: "Create a free Folio account and publish a professional portfolio in minutes.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Build your portfolio"
      subtitle="Free to start. Choose a template, add your work, publish to a public URL you can share."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-mint hover:text-[#a3e6d8]">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
