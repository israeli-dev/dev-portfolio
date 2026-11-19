import type { PortfolioView } from "@/lib/portfolio-view";
import { isVisible, contactItems, FolioCredit , pfRootClass } from "@/components/portfolio/shared";

/**
 * Monograph — editorial print layout: serif masthead, two-column record,
 * hairline rules and no card chrome.
 */
export function TemplateMonograph({ view }: { view: PortfolioView }) {
  const contacts = contactItems(view);
  const name = view.title.split(" — ")[0];

  return (
    <div className={pfRootClass(view)} style={{ ["--accent" as string]: view.accent }}>
      <div className="mx-auto max-w-[980px] px-6 py-10 md:px-10 md:py-16">
        <header>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--pf-line)" }}>
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>
              Portfolio · {new Date().getFullYear()}
            </p>
            <p className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>
              {view.location || "—"}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[44px] leading-[0.94] font-normal tracking-[-0.03em] md:text-[68px]">{name}</h1>
              <p className="mt-4 max-w-md text-[15px] leading-snug italic md:text-[17px]" style={{ color: "var(--pf-muted)" }}>
                {view.headline}
              </p>
            </div>
            <div className="shrink-0 text-left md:text-right">
              {view.availability && (
                <p className="font-mono text-[9px] tracking-[0.14em] uppercase" style={{ color: view.accent }}>
                  {view.availability}
                </p>
              )}
              <div className="mt-2 space-y-1">
                {contacts.slice(0, 3).map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block text-[11.5px] underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-current"
                    style={{ color: "var(--pf-muted)" }}
                  >
                    {item.value}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="mt-12 h-px w-full" style={{ background: view.accent, opacity: 0.65 }} />

        <div className="mt-10 grid gap-10 md:grid-cols-[180px_1fr] md:gap-14">
          <aside className="space-y-8">
            {isVisible(view, "skills") && view.skillGroups.length > 0 && (
              <div>
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Capabilities</h2>
                <div className="mt-3 space-y-3">
                  {view.skillGroups.slice(0, 4).map((group) => (
                    <div key={group.name}>
                      <p className="text-[11px] font-medium">{group.name}</p>
                      <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>
                        {group.skills.map((skill) => skill.name).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isVisible(view, "contact") && (
              <div>
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Contact</h2>
                <div className="mt-3 space-y-1.5">
                  {contacts.map((item) => (
                    <a key={item.label + item.value} href={item.href} className="block text-[11px] underline-offset-4 hover:underline" style={{ color: "var(--pf-text)" }}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="min-w-0 space-y-12">
            {isVisible(view, "about") && view.bio && (
              <section id="about">
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Profile</h2>
                <div className="mt-4 space-y-4 text-[14.5px] leading-[1.75]" style={{ color: "var(--pf-text)" }}>
                  {view.bio.split("\n\n").slice(0, 4).map((paragraph) => (
                    <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "projects") && view.projects.length > 0 && (
              <section id="projects">
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Selected work</h2>
                <div className="mt-4">
                  {view.projects.map((project, index) => (
                    <article key={project.id} className="grid gap-3 border-t py-5 sm:grid-cols-[28px_1fr]" style={{ borderColor: "var(--pf-line)" }}>
                      <span className="font-mono text-[10px]" style={{ color: view.accent }}>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-[20px] leading-tight tracking-[-0.01em]">{project.name}</h3>
                          <span className="font-mono text-[8.5px] tracking-[0.12em] uppercase" style={{ color: "var(--pf-muted)" }}>
                            {project.status.replace(/-/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{project.tagline}</p>
                        <p className="mt-2 font-mono text-[9px] tracking-[0.06em]" style={{ color: "var(--pf-muted)" }}>
                          {project.stack.slice(0, 4).join(" / ")}
                        </p>
                        <div className="mt-2.5 flex gap-4">
                          {project.repoUrl && (
                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-[10.5px] underline underline-offset-4" style={{ color: view.accent }}>
                              Repository
                            </a>
                          )}
                          {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-[10.5px] underline underline-offset-4" style={{ color: view.accent }}>
                              Live project
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "experience") && view.experiences.length > 0 && (
              <section id="experience">
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Experience</h2>
                <div className="mt-4">
                  {view.experiences.map((experience) => (
                    <div key={experience.id} className="grid gap-2 border-t py-4 sm:grid-cols-[130px_1fr]" style={{ borderColor: "var(--pf-line)" }}>
                      <p className="font-mono text-[9.5px] tracking-[0.06em]" style={{ color: "var(--pf-muted)" }}>
                        {experience.startDate} — {experience.current ? "Present" : experience.endDate || "—"}
                      </p>
                      <div>
                        <p className="text-[14px]">{experience.role}</p>
                        <p className="text-[11.5px] italic" style={{ color: "var(--pf-muted)" }}>{experience.organization}</p>
                        {experience.summary && <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{experience.summary}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "education") && view.education.length > 0 && (
              <section id="education">
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Education</h2>
                <div className="mt-4 space-y-3">
                  {view.education.map((entry) => (
                    <div key={entry.id} className="border-t pt-3" style={{ borderColor: "var(--pf-line)" }}>
                      <p className="text-[14px]">{entry.degree}</p>
                      <p className="text-[11.5px] italic" style={{ color: "var(--pf-muted)" }}>
                        {entry.institution}
                        {entry.year ? `, ${entry.year}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "achievements") && view.achievements.length > 0 && (
              <section id="achievements">
                <h2 className="font-mono text-[8.5px] tracking-[0.18em] uppercase" style={{ color: "var(--pf-muted)" }}>Recognition</h2>
                <div className="mt-4 space-y-3">
                  {view.achievements.map((achievement) => (
                    <div key={achievement.id} className="border-t pt-3" style={{ borderColor: "var(--pf-line)" }}>
                      <p className="text-[13px]">{achievement.title}</p>
                      {achievement.detail && <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{achievement.detail}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className="mt-14 flex items-center justify-between border-t pt-5" style={{ borderColor: "var(--pf-line)" }}>
          <FolioCredit light={view.appearance === "light"} />
          <p className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: "var(--pf-muted)" }}>{view.location}</p>
        </footer>
      </div>
    </div>
  );
}
