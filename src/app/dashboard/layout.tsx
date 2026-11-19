import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Folio" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const portfolio = await getPortfolioForUser(user.id);

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, role: user.role }}
      portfolio={
        portfolio
          ? { slug: portfolio.slug, published: portfolio.published, title: portfolio.title, template: portfolio.template }
          : null
      }
      unread={portfolio?.messages?.filter((message) => !message.read).length ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
