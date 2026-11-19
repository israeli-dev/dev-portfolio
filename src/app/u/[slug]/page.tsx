import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getPublishedPortfolio } from "@/lib/queries";
import { toPortfolioView } from "@/lib/portfolio-view";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";

type Params = { params: Promise<{ slug: string }> };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPublishedPortfolio(slug);
  if (!portfolio) return { title: "Portfolio not found", robots: { index: false, follow: false } };

  const title = portfolio.title || `${portfolio.user.name} — Portfolio`;
  const description = portfolio.headline || portfolio.bio.slice(0, 150) || `${portfolio.user.name}'s professional portfolio.`;
  const ogImage = portfolio.coverUrl || portfolio.avatarUrl || undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/u/${portfolio.slug}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/u/${portfolio.slug}`,
      siteName: "Folio",
      images: ogImage ? [{ url: ogImage, alt: portfolio.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: ogImage ? [ogImage] : undefined },
    robots: { index: true, follow: true },
  };
}

export default async function PublicPortfolioPage({ params }: Params) {
  const { slug } = await params;
  const portfolio = await getPublishedPortfolio(slug);
  if (!portfolio) notFound();

  const view = toPortfolioView(portfolio);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: view.title.split(" — ")[0] || portfolio.user.name,
    description: view.headline || view.bio.slice(0, 200),
    url: `${siteUrl}/u/${view.slug}`,
    jobTitle: view.headline || undefined,
    email: view.email || undefined,
    address: view.location || undefined,
    sameAs: view.socialLinks.filter((link) => link.url.startsWith("http")).map((link) => link.url),
    knowsAbout: view.skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)).slice(0, 20),
    image: view.avatarUrl || view.coverUrl || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PortfolioRenderer view={view} />

      <div className="border-t border-line bg-ink no-print">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-[11.5px] text-muted">
            This portfolio was published independently with{" "}
            <Link href="/" className="text-mint transition-colors hover:text-[#a3e6d8]">
              Folio
            </Link>
            .
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-[11.5px] text-text-2 transition-colors hover:text-mint"
          >
            Build your own
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </>
  );
}
