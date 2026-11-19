import type { PortfolioView } from "@/lib/portfolio-view";
import { isVisible, contactItems , pfRootClass } from "@/components/portfolio/shared";

const STATUS_TOKEN: Record<string, string> = {
  live: "deployed",
  completed: "complete",
  "in-development": "building",
  experimental: "experimental",
  planned: "planned",
  archived: "archived",
};

/** Terminal — monospaced index: numbered rows, dotted leaders, command header. */
export function TemplateTerminal({ view }: { view: PortfolioView }) {
  const contacts = contactItems(view);
  const handle = view.slug;

  return (
    <div className={pfRootClass(view)} style={{ ["--accent" as string]: view.accent }}>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-14">
        <div className="rounded-lg border" style={{ borderColor: "var(--pf-line)", background: "var(--pf-panel)" }}>
          <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--pf-line)" }}>
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="size-2 rounded-full" style={{ background: "#ff5f57", opacity: 0.7 }} />
              <span className="size-2 rounded-full" style={{ background: "#febc2e", opacity: 0.7 }} />
              <span className="size-2 rounded-full" style={{ background: "#28c840", opacity: 0.7 }} />
            </div>
            <p className="text-[9px] tracking-[0.06em]" style={{ color: "var(--pf-muted)" }}>
              {handle} — portfolio — zsh
            </p>
            <span className="text-[9px]" style={{ color: "var(--pf-accent)" }}>●</span>
          </div>

          <div className="px-4 py-6 md:px-8 md:py-10">
            <p className="text-[11px]" style={{ color: "var(--pf-muted)" }}>
              <span style={{ color: "var(--pf-accent)" }}>➜</span> ~ whoami
            </p>
            <h1 className="mt-2 text-[34px] leading-none font-medium tracking-[-0.03em] md:text-[52px]">
              {view.title.split(" — ")[0]}
            </h1>
            <p className="mt-3 text-[12.5px] leading-relaxed md:text-[13.5px]" style={{ color: "var(--pf-text)" }}>
              {view.headline}
            </p>
            <p className="mt-1.5 text-[10.5px]" style={{ color: "var(--pf-muted)" }}>
              {view.location && `// ${view.location}`} {view.availability && `· ${view.availability}`}
            </p>

            <p className="mt-8 text-[11px]" style={{ color: "var(--pf-muted)" }}>
              <span style={{ color: "var(--pf-accent)" }}>➜</span> ~ cat contact.txt
            </p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              {contacts.map((item) => (
                <a
                  key={item.label + item.value}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-[11px] underline decoration-dotted underline-offset-4"
                  style={{ color: "var(--pf-accent)" }}
                >
                  {item.label.toLowerCase()}()
                </a>
              ))}
            </div>
          </div>
        </div>

        <main className="mt-10 space-y-10">
          {isVisible(view, "about") && view.bio && (
            <Block label="about" accent={view.accent}>
              <div className="space-y-3 text-[12.5px] leading-[1.85]" style={{ color: "var(--pf-muted)" }}>
                {view.bio.split("\n\n").slice(0, 4).map((paragraph) => (
                  <p key={paragraph.slice(0, 20)}>{paragraph}</p>
                ))}
              </div>
            </Block>
          )}

          {isVisible(view, "projects") && view.projects.length > 0 && (
            <Block label="projects" accent={view.accent} count={view.projects.length}>
              <div>
                {view.projects.map((project, index) => (
                  <div key={project.id} className="group border-b py-4 last:border-0" style={{ borderColor: "var(--pf-line)" }}>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[10px]" style={{ color: "var(--pf-accent)" }}>
                        [{String(index + 1).padStart(2, "0")}]
                      </span>
                      <h3 className="text-[13.5px] font-medium tracking-[-0.01em]">{project.name}</h3>
                      <span className="text-[9px]" style={{ color: "var(--pf-muted)" }}>
                        ({STATUS_TOKEN[project.status] ?? project.status})
                      </span>
                      <span className="hidden flex-1 border-b border-dotted sm:block" style={{ borderColor: "var(--pf-line)" }} aria-hidden />
                      <span className="text-[9.5px]" style={{ color: "var(--pf-muted)" }}>
                        {project.stack.slice(0, 3).join(" · ")}
                      </span>
                    </div>
                    <p className="mt-1.5 max-w-2xl pl-8 text-[11.5px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>
                      {project.tagline}
                    </p>
                    <div className="mt-1.5 flex gap-4 pl-8 text-[10px]">
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--pf-text)" }} className="hover:underline">
                          --repo
                        </a>
                      )}
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--pf-accent)" }} className="hover:underline">
                          --live
                        </a>
                      )}
                      {project.progress !== null && (
                        <span style={{ color: "var(--pf-muted)" }}>{project.progress}% built</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {isVisible(view, "skills") && view.skillGroups.length > 0 && (
            <Block label="skills" accent={view.accent}>
              <div className="grid gap-4 sm:grid-cols-2">
                {view.skillGroups.map((group) => (
                  <div key={group.name}>
                    <p className="text-[10.5px]" style={{ color: "var(--pf-accent)" }}>{group.name.toLowerCase()}/</p>
                    <ul className="mt-1.5 space-y-1">
                      {group.skills.map((skill) => (
                        <li key={skill.name} className="text-[11px]" style={{ color: "var(--pf-muted)" }}>
                          <span style={{ color: "var(--pf-text)" }}>{skill.name}</span>
                          {skill.learning && <span className="text-[9px]" style={{ color: "var(--pf-accent)" }}> // learning</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {isVisible(view, "experience") && view.experiences.length > 0 && (
            <Block label="experience" accent={view.accent}>
              <div className="space-y-4">
                {view.experiences.map((experience) => (
                  <div key={experience.id} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                    <p className="text-[9.5px]" style={{ color: "var(--pf-muted)" }}>
                      {experience.startDate}..{experience.current ? "now" : experience.endDate || "—"}
                    </p>
                    <div>
                      <p className="text-[12px]" style={{ color: "var(--pf-text)" }}>
                        {experience.role} <span style={{ color: "var(--pf-muted)" }}>@ {experience.organization}</span>
                      </p>
                      {experience.summary && <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--pf-muted)" }}>{experience.summary}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {isVisible(view, "education") && view.education.length > 0 && (
            <Block label="education" accent={view.accent}>
              <div className="space-y-3">
                {view.education.map((entry) => (
                  <div key={entry.id}>
                    <p className="text-[12px]" style={{ color: "var(--pf-text)" }}>{entry.degree}</p>
                    <p className="text-[10.5px]" style={{ color: "var(--pf-muted)" }}>
                      {entry.institution}
                      {entry.year ? ` · ${entry.year}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {isVisible(view, "achievements") && view.achievements.length > 0 && (
            <Block label="achievements" accent={view.accent}>
              <ul className="space-y-2">
                {view.achievements.map((achievement) => (
                  <li key={achievement.id} className="text-[11px]" style={{ color: "var(--pf-muted)" }}>
                    <span style={{ color: "var(--pf-accent)" }}>✓</span> <span style={{ color: "var(--pf-text)" }}>{achievement.title}</span>
                    {achievement.detail && <span className="block pl-4 text-[10.5px]">{achievement.detail}</span>}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <div className="border-t pt-6" style={{ borderColor: "var(--pf-line)" }}>
            <p className="text-[10px]" style={{ color: "var(--pf-muted)" }}>
              <span style={{ color: "var(--pf-accent)" }}>➜</span> ~ exit
            </p>
            <p className="mt-1.5 text-[9.5px]" style={{ color: "var(--pf-muted)" }}>
              published with folio · {new Date().getFullYear()}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Block({ label, accent, count, children }: { label: string; accent: string; count?: number; children: React.ReactNode }) {
  return (
    <section id={label}>
      <div className="mb-4 flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--pf-line)" }}>
        <span className="text-[10px]" style={{ color: accent }}>##</span>
        <h2 className="text-[10.5px] tracking-[0.08em] uppercase" style={{ color: "var(--pf-text)" }}>{label}</h2>
        {typeof count === "number" && <span className="text-[9px]" style={{ color: "var(--pf-muted)" }}>({count})</span>}
      </div>
      {children}
    </section>
  );
}
