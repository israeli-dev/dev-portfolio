import type { PortfolioView } from "@/lib/portfolio-view";
import { isVisible, contactItems, FolioCredit , pfRootClass } from "@/components/portfolio/shared";

const FIG = (index: number, label: string) => ({ index: `FIG. ${String(index).padStart(2, "0")}`, label });

/** Atlas — a scientific field plate: split hero, annotated figures, data tables. */
export function TemplateAtlas({ view }: { view: PortfolioView }) {
  const contacts = contactItems(view);
  const name = view.title.split(" — ")[0];

  return (
    <div className={pfRootClass(view)} style={{ ["--accent" as string]: view.accent }}>
      <header className="relative overflow-hidden border-b" style={{ borderColor: "var(--pf-line)" }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--pf-line) 1px, transparent 1px), linear-gradient(to bottom, var(--pf-line) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 90% at 70% 10%, #000 20%, transparent 75%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-12 md:px-10 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: "var(--pf-muted)" }}>
              <span style={{ color: view.accent }}>Field portfolio</span>
              <span>/</span>
              <span>{view.location || "Location not set"}</span>
              {view.availability && (
                <>
                  <span>/</span>
                  <span>{view.availability}</span>
                </>
              )}
            </div>

            <h1 className="mt-6 text-[46px] leading-[0.94] font-medium tracking-[-0.045em] md:text-[68px]">
              {name}
            </h1>
            <p className="mt-4 max-w-lg text-[17px] leading-snug md:text-[20px]" style={{ color: "var(--pf-text)" }}>
              {view.headline}
            </p>
            {view.bio && (
              <p className="mt-4 max-w-lg text-[13px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>
                {view.bio.split("\n\n")[0]}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {contacts.map((item) => (
                <a
                  key={item.label + item.value}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-[12px] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
                  style={{ color: view.accent, textDecorationColor: "color-mix(in srgb, var(--pf-accent) 40%, transparent)" }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pf-card relative aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--pf-accent) 22%, transparent), transparent 65%)" }} aria-hidden />
              <svg viewBox="0 0 320 240" className="absolute inset-0 size-full" aria-hidden>
                {Array.from({ length: 11 }).map((_, index) => (
                  <path
                    key={index}
                    d={`M-10 ${140 + index * 12} C 70 ${100 + index * 13}, 170 ${190 + index * 10}, 340 ${120 + index * 12}`}
                    stroke="var(--pf-accent)"
                    strokeWidth={index === 5 ? 1.1 : 0.5}
                    fill="none"
                    opacity={0.45 - index * 0.025}
                  />
                ))}
                <line x1="0" y1="192" x2="320" y2="192" stroke="var(--pf-line)" strokeDasharray="3 5" />
                <line x1="238" y1="0" x2="238" y2="240" stroke="var(--pf-line)" strokeDasharray="3 5" />
                <circle cx="238" cy="192" r="4" fill="var(--pf-accent)" />
                <circle cx="238" cy="192" r="12" stroke="var(--pf-accent)" fill="none" opacity="0.5" />
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 font-mono text-[8.5px] tracking-[0.1em] uppercase" style={{ color: "var(--pf-muted)" }}>
                <div className="space-y-1">
                  <p>Fig. 00 — Field record</p>
                  <p>{view.title.split(" — ")[1] ?? "Professional portfolio"}</p>
                </div>
                <span style={{ color: view.accent }}>1:1</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
          <main className="min-w-0 space-y-14">
            {isVisible(view, "about") && view.bio && (
              <section id="about">
                <FigureHeading fig={FIG(1, "Profile")} accent={view.accent} />
                <div className="mt-5 space-y-4 text-[13.5px] leading-[1.8]" style={{ color: "var(--pf-muted)" }}>
                  {view.bio.split("\n\n").slice(0, 4).map((paragraph) => (
                    <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "projects") && view.projects.length > 0 && (
              <section id="projects">
                <FigureHeading fig={FIG(2, "Projects")} accent={view.accent} />
                <div className="mt-5 space-y-3">
                  {view.projects.map((project) => (
                    <article key={project.id} className="pf-card overflow-hidden">
                      <div className="flex">
                        <div className="w-[3px] shrink-0" style={{ background: view.accent, opacity: project.status === "live" ? 0.9 : 0.35 }} aria-hidden />
                        <div className="min-w-0 flex-1 p-4 md:p-5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="text-[16px] font-medium tracking-[-0.01em]">{project.name}</h3>
                              <p className="mt-1 font-mono text-[8.5px] tracking-[0.1em] uppercase" style={{ color: "var(--pf-muted)" }}>
                                {project.status.replace(/-/g, " ")} · {project.stack.slice(0, 3).join(" / ")}
                              </p>
                            </div>
                            <div className="flex gap-3 text-[10.5px]">
                              {project.demoUrl && (
                                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" style={{ color: view.accent }}>
                                  Demo ↗
                                </a>
                              )}
                              {project.repoUrl && (
                                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--pf-muted)" }}>
                                  Source ↗
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{project.tagline}</p>
                          {project.progress !== null && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="h-[3px] w-32 overflow-hidden rounded-full" style={{ background: "var(--pf-line)" }}>
                                <div className="h-full" style={{ width: `${project.progress}%`, background: view.accent }} />
                              </div>
                              <span className="font-mono text-[8.5px]" style={{ color: "var(--pf-muted)" }}>{project.progress}%</span>
                            </div>
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
                <FigureHeading fig={FIG(3, "Field log")} accent={view.accent} />
                <ol className="mt-5 space-y-5">
                  {view.experiences.map((experience) => (
                    <li key={experience.id} className="grid gap-2 border-t pt-4 sm:grid-cols-[110px_1fr]" style={{ borderColor: "var(--pf-line)" }}>
                      <p className="font-mono text-[9px] tracking-[0.06em]" style={{ color: "var(--pf-muted)" }}>
                        {experience.startDate} — {experience.current ? "Present" : experience.endDate || "—"}
                      </p>
                      <div>
                        <p className="text-[14px] font-medium">{experience.role}</p>
                        <p className="text-[11.5px]" style={{ color: "var(--pf-muted)" }}>
                          {experience.organization}
                          {experience.location ? ` · ${experience.location}` : ""}
                        </p>
                        {experience.summary && <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{experience.summary}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {isVisible(view, "education") && view.education.length > 0 && (
              <section id="education">
                <FigureHeading fig={FIG(4, "Education")} accent={view.accent} />
                <div className="mt-5 space-y-3">
                  {view.education.map((entry) => (
                    <div key={entry.id} className="border-t pt-3" style={{ borderColor: "var(--pf-line)" }}>
                      <p className="text-[13.5px] font-medium">{entry.degree}</p>
                      <p className="text-[11.5px]" style={{ color: "var(--pf-muted)" }}>
                        {entry.institution}
                        {entry.year ? ` · ${entry.year}` : ""}
                      </p>
                      {entry.detail && <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{entry.detail}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "achievements") && view.achievements.length > 0 && (
              <section id="achievements">
                <FigureHeading fig={FIG(5, "Findings")} accent={view.accent} />
                <div className="mt-5 space-y-2">
                  {view.achievements.map((achievement) => (
                    <div key={achievement.id} className="border-t py-3" style={{ borderColor: "var(--pf-line)" }}>
                      <p className="text-[12.5px]">{achievement.title}</p>
                      {achievement.detail && <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{achievement.detail}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-8">
            {isVisible(view, "skills") && view.skillGroups.length > 0 && (
              <section>
                <p className="font-mono text-[8.5px] tracking-[0.16em] uppercase" style={{ color: "var(--pf-muted)" }}>Data table — capability</p>
                <div className="mt-3 space-y-4">
                  {view.skillGroups.map((group) => (
                    <div key={group.name}>
                      <p className="border-b pb-1 text-[11.5px] font-medium" style={{ borderColor: "var(--pf-line)" }}>{group.name}</p>
                      <ul className="mt-2 space-y-1">
                        {group.skills.map((skill) => (
                          <li key={skill.name} className="flex items-baseline justify-between gap-2 text-[11px]" style={{ color: "var(--pf-muted)" }}>
                            <span>{skill.name}</span>
                            <span className="font-mono text-[8px] tracking-[0.06em] uppercase" style={{ color: skill.learning ? view.accent : "var(--pf-muted)" }}>
                              {skill.learning ? "wip" : "use"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isVisible(view, "contact") && (
              <section>
                <p className="font-mono text-[8.5px] tracking-[0.16em] uppercase" style={{ color: "var(--pf-muted)" }}>Coordinates</p>
                <ul className="mt-3 space-y-2">
                  {contacts.map((item) => (
                    <li key={item.label + item.value}>
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-baseline justify-between gap-2 text-[11px]" style={{ color: "var(--pf-text)" }}>
                        <span>{item.label}</span>
                        <span className="truncate font-mono text-[9px]" style={{ color: "var(--pf-muted)" }}>{item.value}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="pf-card p-4">
              <p className="font-mono text-[8px] tracking-[0.14em] uppercase" style={{ color: "var(--pf-muted)" }}>Method</p>
              <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>
                Every project links to its source. Status reflects the current state of the work, not its ambition.
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-5" style={{ borderColor: "var(--pf-line)" }}>
          <FolioCredit light={view.appearance === "light"} />
          <span className="font-mono text-[8.5px] tracking-[0.12em] uppercase" style={{ color: "var(--pf-muted)" }}>
            {view.location} · {new Date().getFullYear()}
          </span>
        </footer>
      </div>
    </div>
  );
}

function FigureHeading({ fig, accent }: { fig: { index: string; label: string }; accent: string }) {
  return (
    <div className="flex items-center gap-3 border-b pb-2" style={{ borderColor: "var(--pf-line)" }}>
      <span className="font-mono text-[8.5px] tracking-[0.12em]" style={{ color: accent }}>{fig.index}</span>
      <span className="text-[12px] font-medium">{fig.label}</span>
    </div>
  );
}
