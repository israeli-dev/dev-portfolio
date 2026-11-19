import { ArrowUpRight } from "lucide-react";
import type { PortfolioView } from "@/lib/portfolio-view";
import { statusMeta } from "@/lib/domain";
import { isVisible, Monogram, contactItems, FolioCredit , pfRootClass } from "@/components/portfolio/shared";

const STATUS_COLOR: Record<string, string> = {
  live: "var(--pf-accent)",
  completed: "#8CB4FF",
  "in-development": "#E0A458",
  experimental: "#C9A7EB",
  planned: "#8b949e",
  archived: "#6b7480",
};

/** Signal — engineering-first: identity rail on the left, content stream right. */
export function TemplateSignal({ view }: { view: PortfolioView }) {
  const contacts = contactItems(view);
  const nav = [
    ["about", "About"],
    ["projects", "Work"],
    ["skills", "Skills"],
    ["experience", "Experience"],
    ["contact", "Contact"],
  ].filter(([id]) => isVisible(view, id as never));

  return (
    <div className={pfRootClass(view)} style={{ ["--accent" as string]: view.accent }}>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-10 md:px-10 md:py-16 lg:grid-cols-[286px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-12 lg:self-start">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <Monogram
              name={view.title}
              className="size-16 text-[20px]"
              style={{ background: "color-mix(in srgb, var(--pf-accent) 12%, transparent)", borderColor: "var(--pf-line)", color: "var(--pf-accent)" }}
            />
            <div>
              <h1 className="text-[22px] leading-tight font-medium tracking-[-0.02em]">{view.title.split(" — ")[0]}</h1>
              <p className="mt-1.5 font-mono text-[10px] leading-relaxed tracking-[0.08em] uppercase" style={{ color: "var(--pf-muted)" }}>
                {view.headline || "Professional portfolio"}
              </p>
            </div>
          </div>

          {view.availability && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] uppercase" style={{ borderColor: "var(--pf-line)", color: "var(--pf-accent)" }}>
              <span className="size-1.5 rounded-full" style={{ background: "var(--pf-accent)" }} />
              {view.availability}
            </p>
          )}

          <nav aria-label="Sections" className="mt-8 hidden lg:block">
            <ul className="space-y-1.5">
              {nav.map(([id, label], index) => (
                <li key={id}>
                  <a href={`#${id}`} className="group flex items-center gap-3 py-1 text-[12px] transition-colors" style={{ color: "var(--pf-muted)" }}>
                    <span className="font-mono text-[9.5px] opacity-60">0{index + 1}</span>
                    <span className="transition-colors group-hover:text-[var(--pf-text)]">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 space-y-2 border-t pt-6" style={{ borderColor: "var(--pf-line)" }}>
            {contacts.map((item) => (
              <a
                key={item.label + item.value}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 text-[11.5px] transition-opacity hover:opacity-70"
                style={{ color: "var(--pf-muted)" }}
              >
                <span>{item.label}</span>
                <span className="truncate font-mono text-[10px]">{item.value}</span>
              </a>
            ))}
          </div>

          <div className="mt-6 hidden lg:block">
            <FolioCredit />
          </div>
        </aside>

        <main className="min-w-0 space-y-16">
          {isVisible(view, "about") && (
            <section id="about" className="scroll-mt-8">
              <SectionMark index="01" label="Profile" accent={view.accent} />
              <p className="mt-5 max-w-2xl text-[22px] leading-[1.32] font-medium tracking-[-0.02em] md:text-[27px]">
                {view.headline || view.bio.split("\n")[0]}
              </p>
              {view.bio && (
                <div className="mt-6 max-w-2xl space-y-4 text-[13.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>
                  {view.bio.split("\n\n").slice(0, 4).map((paragraph) => (
                    <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                  ))}
                </div>
              )}
            </section>
          )}

          {isVisible(view, "projects") && view.projects.length > 0 && (
            <section id="projects" className="scroll-mt-8">
              <SectionMark index="02" label="Selected work" accent={view.accent} />
              <div className="mt-5 divide-y" style={{ borderColor: "var(--pf-line)" }}>
                {view.projects.map((project, index) => {
                  const meta = statusMeta(project.status);
                  return (
                    <article key={project.id} className="group grid gap-3 border-t py-6 sm:grid-cols-[36px_1fr_auto] sm:items-start" style={{ borderColor: "var(--pf-line)" }}>
                      <span className="font-mono text-[10.5px] opacity-40">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-[16px] font-medium tracking-[-0.01em]">{project.name}</h3>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[8.5px] tracking-[0.08em] uppercase"
                            style={{ borderColor: "var(--pf-line)", color: STATUS_COLOR[project.status] ?? "var(--pf-muted)" }}
                          >
                            <span className="size-1 rounded-full" style={{ background: STATUS_COLOR[project.status] ?? "var(--pf-muted)" }} />
                            {meta.short}
                          </span>
                        </div>
                        <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>
                          {project.tagline}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9.5px]" style={{ color: "var(--pf-muted)" }}>
                          {project.stack.slice(0, 5).map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:justify-end">
                        {project.demoUrl && (
                          <a href={project.demoUrl} className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: "var(--pf-accent)" }} target="_blank" rel="noopener noreferrer">
                            Live <ArrowUpRight className="size-3" aria-hidden />
                          </a>
                        )}
                        {project.repoUrl && (
                          <a href={project.repoUrl} className="text-[10.5px]" style={{ color: "var(--pf-muted)" }} target="_blank" rel="noopener noreferrer">
                            Code
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {isVisible(view, "skills") && view.skillGroups.length > 0 && (
            <section id="skills" className="scroll-mt-8">
              <SectionMark index="03" label="Capability" accent={view.accent} />
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {view.skillGroups.map((group) => (
                  <div key={group.name}>
                    <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase" style={{ color: "var(--pf-muted)" }}>{group.name}</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {group.skills.map((skill) => (
                        <li
                          key={skill.name}
                          className="rounded border px-2 py-1 text-[11px]"
                          style={{
                            borderColor: "var(--pf-line)",
                            color: skill.learning ? "var(--pf-muted)" : "var(--pf-text)",
                            borderStyle: skill.learning ? "dashed" : "solid",
                          }}
                        >
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isVisible(view, "experience") && view.experiences.length > 0 && (
            <section id="experience" className="scroll-mt-8">
              <SectionMark index="04" label="Experience" accent={view.accent} />
              <ol className="mt-5 space-y-6">
                {view.experiences.map((experience) => (
                  <li key={experience.id} className="border-l pl-5" style={{ borderColor: "var(--pf-line)" }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-[14.5px] font-medium">{experience.role}</h3>
                      <span className="font-mono text-[9.5px] uppercase" style={{ color: "var(--pf-muted)" }}>
                        {experience.startDate} — {experience.current ? "Present" : experience.endDate || "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px]" style={{ color: "var(--pf-muted)" }}>
                      {experience.organization}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </p>
                    {experience.summary && <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{experience.summary}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {isVisible(view, "education") && view.education.length > 0 && (
            <section id="education" className="scroll-mt-8">
              <SectionMark index="05" label="Education" accent={view.accent} />
              <ul className="mt-5 space-y-4">
                {view.education.map((entry) => (
                  <li key={entry.id}>
                    <p className="text-[13.5px] font-medium">{entry.degree}</p>
                    <p className="text-[11.5px]" style={{ color: "var(--pf-muted)" }}>
                      {entry.institution}
                      {entry.year ? ` · ${entry.year}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isVisible(view, "achievements") && view.achievements.length > 0 && (
            <section id="achievements" className="scroll-mt-8">
              <SectionMark index="06" label="Achievements" accent={view.accent} />
              <ul className="mt-5 space-y-3">
                {view.achievements.map((achievement) => (
                  <li key={achievement.id} className="border px-4 py-3" style={{ borderColor: "var(--pf-line)" }}>
                    <p className="text-[12.5px] font-medium">{achievement.title}</p>
                    {achievement.detail && <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{achievement.detail}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isVisible(view, "contact") && (
            <section id="contact" className="scroll-mt-8 border-t pt-8" style={{ borderColor: "var(--pf-line)" }}>
              <p className="font-mono text-[9.5px] tracking-[0.12em] uppercase" style={{ color: "var(--pf-muted)" }}>Get in touch</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                {contacts.map((item) => (
                  <a
                    key={item.label + item.value}
                    href={item.href}
                    className="text-[13px] underline-offset-4 hover:underline"
                    style={{ color: "var(--pf-accent)" }}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mt-10 lg:hidden">
                <FolioCredit />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionMark({ index, label, accent }: { index: string; label: string; accent: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase" style={{ color: accent }}>{index}</span>
      <span className="h-px w-6" style={{ background: "var(--pf-line)" }} />
      <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase" style={{ color: "var(--pf-muted)" }}>{label}</span>
    </div>
  );
}
