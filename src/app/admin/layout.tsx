import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/ui/logo";
import { AdminNav } from "@/components/dashboard/admin-nav";
import { signOutAction } from "@/app/actions/auth";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Folio" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "OWNER") redirect("/dashboard?denied=admin");

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/92 backdrop-blur-lg">
        <div className="shell flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo href="/" />
            <span className="hidden h-4 w-px bg-line-strong sm:block" aria-hidden />
            <span className="hidden items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-sand uppercase sm:flex">
              <Shield className="size-3" aria-hidden />
              Owner console
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className={buttonClasses("ghost", "sm")}>
              <ArrowLeft className="size-3.5" aria-hidden />
              Dashboard
            </Link>
            <form action={signOutAction}>
              <button type="submit" className={buttonClasses("secondary", "sm")}>Sign out</button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>

      <main className="shell py-8 md:py-10">{children}</main>
    </div>
  );
}
