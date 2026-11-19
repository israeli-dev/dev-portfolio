import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { AboutSection } from "@/components/marketing/about-section";
import { JourneySection } from "@/components/marketing/journey-section";
import { SkillsSection } from "@/components/marketing/skills-section";
import { BuildingSection } from "@/components/marketing/building-section";
import { ExperienceSection } from "@/components/marketing/experience-section";
import { ContactSection } from "@/components/marketing/contact-section";
import { PlatformCta } from "@/components/marketing/platform-cta";
import { ProjectCard } from "@/components/marketing/project-card";
import { Section } from "@/components/ui/section";
import { buttonClasses } from "@/components/ui/button";
import { getOwnerPortfolio, getOwnerProfile, getTimeline } from "@/lib/queries";
import { OWNER } from "@/content/personal";

export default async function HomePage() {
  const data = await getOwnerPortfolio();
  const [profile, timeline] = await Promise.all([getOwnerProfile(), getTimeline()]);

  if (!data) {
    return (
      <div className="shell flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">Database not seeded</p>
        <h1 className="mt-3 text-[30px] font-medium tracking-[-0.02em]">Run the setup to load the portfolio.</h1>
        <pre className="mt-6 rounded-lg border border-line bg-surface px-5 py-3 font-mono text-[12px] text-mint">
          npm run setup
        </pre>
      </div>
    );
  }

  const { view, portfolio } = data;
  const featured = view.projects.filter((project) => project.featured).slice(0, 3);
  const showFeatured = featured.length ? featured : view.projects.slice(0, 3);
  const deployedCount = view.projects.filter((project) => project.status === "live").length;
  const repoCount = view.projects.filter((project) => project.repoUrl).length;

  return (
    <>
      <Hero
        view={view}
        repoCount={repoCount}
        deployedCount={deployedCount}
        avatarUrl={profile?.avatarUrl ?? portfolio.avatarUrl}
      />

      <Section
        id="work"
        eyebrow="Selected work"
        title="Built, deployed, documented."
        description="Four live applications and a set of active experiments. Every card links to a case study with the problem, the architecture and its limitations."
        action={
          <Link href="/projects" className={buttonClasses("secondary", "sm")}>
            All projects
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {showFeatured.map((project, index) => (
            <ProjectCard key={project.id} project={project} featured={index === 0 && showFeatured.length > 2} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.015] px-5 py-4">
          <p className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
            Project data sourced from github.com/israeli-dev · curated by the owner
          </p>
          <a
            href={OWNER.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11.5px] text-mint transition-colors hover:text-[#a3e6d8]"
          >
            View repositories
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </Section>

      <AboutSection view={view} />
      <JourneySection entries={timeline} />
      <BuildingSection projects={view.projects} />
      <SkillsSection groups={view.skillGroups} />
      <ExperienceSection
        experiences={view.experiences}
        achievements={view.achievements}
        certifications={view.certifications}
        education={view.education}
      />
      <ContactSection email={view.email || OWNER.email} socialLinks={view.socialLinks} />
      <PlatformCta />
    </>
  );
}
