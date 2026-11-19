import { Award, Building2, CalendarDays, GraduationCap, MapPin } from "lucide-react";
import { Section } from "@/components/ui/section";
import type { AchievementView, CertificationView, EducationView, ExperienceView } from "@/lib/portfolio-view";

export function ExperienceSection({
  experiences,
  achievements,
  certifications,
  education,
}: {
  experiences: ExperienceView[];
  achievements: AchievementView[];
  certifications: CertificationView[];
  education: EducationView[];
}) {
  const hasAny = experiences.length || achievements.length || certifications.length || education.length;
  if (!hasAny) return null;

  return (
    <Section
      id="experience"
      eyebrow="05 — Record"
      title="Experience, education and evidence."
      description="Only what can be substantiated. Dates are stated as given; nothing is padded."
      bordered
    >
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <h3 className="eyebrow mb-6">Experience</h3>
          {experiences.length ? (
            <ol className="space-y-8">
              {experiences.map((experience) => (
                <li key={experience.id} className="relative border-l border-line pl-6">
                  <span className="absolute top-1.5 -left-[3.5px] size-[7px] rounded-full bg-sand" aria-hidden />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="text-[15.5px] font-medium text-text">{experience.role}</h4>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                      <CalendarDays className="size-3" aria-hidden />
                      {experience.startDate} — {experience.current ? "Present" : experience.endDate || "—"}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-text-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted" aria-hidden />
                      {experience.organization}
                    </span>
                    {experience.location && (
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <MapPin className="size-3.5" aria-hidden />
                        {experience.location}
                      </span>
                    )}
                  </p>
                  {experience.summary && <p className="mt-3 text-[13px] leading-relaxed text-muted">{experience.summary}</p>}
                  {experience.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {experience.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2 text-[12.5px] leading-relaxed text-text-2">
                          <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted" aria-hidden />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                  {experience.tech.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {experience.tech.map((tech) => (
                        <span key={tech} className="rounded border border-line bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-5 text-[12.5px] leading-relaxed text-muted">
              Experience entries are added by the owner in the admin console. Nothing is generated automatically.
            </p>
          )}

          {education.length > 0 && (
            <div className="mt-12">
              <h3 className="eyebrow mb-6">Education</h3>
              <ul className="space-y-5">
                {education.map((entry) => (
                  <li key={entry.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden />
                      <div>
                        <p className="text-[14px] font-medium text-text">{entry.degree}</p>
                        <p className="mt-0.5 text-[12.5px] text-text-2">
                          {entry.institution}
                          {entry.year && <span className="text-muted"> · {entry.year}</span>}
                        </p>
                        {entry.detail && <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{entry.detail}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {achievements.length > 0 && (
            <div className="panel p-5">
              <h3 className="eyebrow mb-4">Achievements</h3>
              <ul className="space-y-4">
                {achievements.map((achievement) => (
                  <li key={achievement.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-sand/25 bg-sand/[0.08] text-sand">
                      <Award className="size-3.5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[12.5px] leading-snug font-medium text-text-2">{achievement.title}</p>
                      {achievement.detail && <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{achievement.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="panel p-5">
              <h3 className="eyebrow mb-4">Certifications & learning</h3>
              <ul className="space-y-3">
                {certifications.map((certification) => (
                  <li key={certification.id} className="text-[12.5px]">
                    <p className="font-medium text-text-2">{certification.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted">
                      {certification.issuer}
                      {certification.year && ` · ${certification.year}`}
                      {certification.learning && " · in progress"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-line p-5">
            <p className="font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">Verification note</p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Every project links to its public repository. If a claim here cannot be checked against the source, it does
              not belong on this page.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
