import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { buttonClasses } from "@/components/ui/button";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/profile");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Identity and contact"
        description="The copy at the top of your portfolio. Written by you — no generated biographies."
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/preview" className={buttonClasses("secondary", "sm")}>
              Preview
            </Link>
            {portfolio.published && (
              <Link href={`/u/${portfolio.slug}`} className={buttonClasses("ghost", "sm")}>
                Live page
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <ProfileEditor
          portfolio={{
            id: portfolio.id,
            title: portfolio.title,
            headline: portfolio.headline,
            bio: portfolio.bio,
            location: portfolio.location,
            email: portfolio.email,
            phone: portfolio.phone,
            availability: portfolio.availability,
            avatarUrl: portfolio.avatarUrl,
            coverUrl: portfolio.coverUrl,
          }}
        />

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-white/[0.02] p-4">
            <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Public URL</p>
            <p className="mt-1.5 truncate font-mono text-[11.5px] text-text-2">/u/{portfolio.slug}</p>
            <Link href="/dashboard/settings" className="mt-2 inline-flex items-center gap-1 text-[10.5px] text-mint hover:text-[#a3e6d8]">
              Change handle
            </Link>
          </div>

          <div className="rounded-xl border border-line bg-white/[0.02] p-4">
            <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Profile image</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Paste a direct image URL (https). Uploads land in a later release — the field accepts any hosted image.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Writing tip</p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Lead with what you build, then the evidence. A specific sentence beats a list of adjectives.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
