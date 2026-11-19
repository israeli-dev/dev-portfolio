import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Flash } from "@/components/dashboard/flash";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { buttonClasses } from "@/components/ui/button";
import { parseList } from "@/lib/json";
import {
  deleteAchievementAction,
  deleteCertificationAction,
  deleteEducationAction,
  deleteExperienceAction,
  deleteSkillAction,
  deleteSocialAction,
  saveAchievementAction,
  saveCertificationAction,
  saveEducationAction,
  saveExperienceAction,
  saveSkillAction,
  saveSocialAction,
} from "@/app/actions/portfolio";

export const metadata = { title: "Content" };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; denied?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/content");
  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");

  const base = "/dashboard/content";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content"
        title="Experience, skills and evidence"
        description="Every field here is your own claim. Add only what you can substantiate — the public page presents it as fact."
      />

      {params.error && <Flash tone="error" message="That entry could not be saved. Check the required fields and try again." />}
      {params.saved && <Flash message="Saved." />}
      {params.denied && <Flash tone="error" message="That entry belongs to another portfolio." />}

      {/* Experience */}
      <section id="experience" className="scroll-mt-6">
        <SectionHeading title="Experience" count={portfolio.experiences.length} hint="Roles, field practice or independent work." />

        <div className="space-y-2">
          {portfolio.experiences.map((experience) => (
            <details key={experience.id} className="group rounded-xl border border-line bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-text">{experience.role}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {experience.organization} · {experience.startDate} — {experience.current ? "Present" : experience.endDate || "—"}
                  </p>
                </div>
                <span className="font-mono text-[9px] tracking-[0.08em] text-muted uppercase group-open:hidden">Edit</span>
              </summary>

              <form action={saveExperienceAction} className="space-y-4 border-t border-line p-4">
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="id" value={experience.id} />
                <input type="hidden" name="redirectTo" value={base} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Role" name="role" defaultValue={experience.role} required />
                  <Input label="Organisation" name="organization" defaultValue={experience.organization} required />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Start" name="startDate" defaultValue={experience.startDate} required />
                  <Input label="End" name="endDate" defaultValue={experience.endDate ?? ""} />
                  <Input label="Location" name="location" defaultValue={experience.location ?? ""} />
                </div>
                <Textarea label="Summary" name="summary" defaultValue={experience.summary} rows={3} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Textarea label="Highlights" name="highlights" defaultValue={parseList(experience.highlights).join("\n")} rows={3} hint="One per line." />
                  <Textarea label="Technologies" name="tech" defaultValue={parseList(experience.tech).join("\n")} rows={3} hint="One per line." />
                </div>
                <label className="flex items-center gap-2 text-[12px] text-text-2">
                  <input type="checkbox" name="current" defaultChecked={experience.current} className="size-4 accent-[#7DD3C0]" />
                  Current role
                </label>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <ConfirmForm
                    action={deleteExperienceAction}
                    title="Delete experience"
                    description="Remove this entry permanently?"
                    triggerLabel="Delete"
                    confirmLabel="Delete"
                  >
                    <input type="hidden" name="portfolioId" value={portfolio.id} />
                    <input type="hidden" name="id" value={experience.id} />
                    <input type="hidden" name="redirectTo" value={base} />
                  </ConfirmForm>
                  <SubmitButton size="sm" pendingLabel="Saving…">Save entry</SubmitButton>
                </div>
              </form>
            </details>
          ))}
        </div>

        <details className="mt-3 rounded-xl border border-dashed border-line-strong">
          <summary className="cursor-pointer list-none px-4 py-3 text-[12px] text-mint">+ Add experience</summary>
          <form action={saveExperienceAction} className="space-y-4 border-t border-line p-4">
            <input type="hidden" name="portfolioId" value={portfolio.id} />
            <input type="hidden" name="redirectTo" value={base} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Role" name="role" required />
              <Input label="Organisation" name="organization" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Start" name="startDate" placeholder="2023" required />
              <Input label="End" name="endDate" placeholder="Leave blank if current" />
              <Input label="Location" name="location" />
            </div>
            <Textarea label="Summary" name="summary" rows={3} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Textarea label="Highlights" name="highlights" rows={3} hint="One per line." />
              <Textarea label="Technologies" name="tech" rows={3} hint="One per line." />
            </div>
            <label className="flex items-center gap-2 text-[12px] text-text-2">
              <input type="checkbox" name="current" className="size-4 accent-[#7DD3C0]" />
              Current role
            </label>
            <SubmitButton size="sm" pendingLabel="Adding…">Add experience</SubmitButton>
          </form>
        </details>
      </section>

      {/* Education */}
      <section id="education" className="scroll-mt-6">
        <SectionHeading title="Education" count={portfolio.education.length} hint="Degrees, programmes and relevant coursework." />
        <div className="grid gap-2 sm:grid-cols-2">
          {portfolio.education.map((entry) => (
            <details key={entry.id} className="rounded-xl border border-line bg-white/[0.02]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-text">{entry.degree}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {entry.institution}
                    {entry.year ? ` · ${entry.year}` : ""}
                  </p>
                </div>
                <span className="font-mono text-[9px] text-muted uppercase">Edit</span>
              </summary>
              <form action={saveEducationAction} className="space-y-4 border-t border-line p-4">
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="id" value={entry.id} />
                <input type="hidden" name="redirectTo" value={base} />
                <Input label="Degree" name="degree" defaultValue={entry.degree} required />
                <Input label="Institution" name="institution" defaultValue={entry.institution} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Year" name="year" defaultValue={entry.year ?? ""} />
                  <Input label="Location" name="location" defaultValue={entry.location ?? ""} />
                </div>
                <Textarea label="Detail" name="detail" defaultValue={entry.detail} rows={3} />
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <ConfirmForm
                    action={deleteEducationAction}
                    title="Delete education"
                    description="Remove this entry?"
                    triggerLabel="Delete"
                    confirmLabel="Delete"
                  >
                    <input type="hidden" name="portfolioId" value={portfolio.id} />
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="redirectTo" value={base} />
                  </ConfirmForm>
                  <SubmitButton size="sm" pendingLabel="Saving…">Save</SubmitButton>
                </div>
              </form>
            </details>
          ))}
        </div>
        <details className="mt-3 rounded-xl border border-dashed border-line-strong">
          <summary className="cursor-pointer list-none px-4 py-3 text-[12px] text-mint">+ Add education</summary>
          <form action={saveEducationAction} className="space-y-4 border-t border-line p-4">
            <input type="hidden" name="portfolioId" value={portfolio.id} />
            <input type="hidden" name="redirectTo" value={base} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Degree" name="degree" required />
              <Input label="Institution" name="institution" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Year" name="year" />
              <Input label="Location" name="location" />
            </div>
            <Textarea label="Detail" name="detail" rows={3} />
            <SubmitButton size="sm" pendingLabel="Adding…">Add education</SubmitButton>
          </form>
        </details>
      </section>

      {/* Skills */}
      <section id="skills" className="scroll-mt-6">
        <SectionHeading title="Skills" count={portfolio.skills.length} hint="Grouped, not a wall of logos. Mark anything still being learned." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.skillGroups.map((group) => {
            const skills = portfolio.skills.filter((skill) => skill.groupId === group.id);
            return (
              <div key={group.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
                <p className="font-mono text-[9px] tracking-[0.1em] text-muted uppercase">{group.name}</p>
                <ul className="mt-2.5 space-y-1">
                  {skills.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span className={skill.learning ? "text-muted" : "text-text-2"}>
                        {skill.name}
                        {skill.learning && <span className="ml-1.5 font-mono text-[8px] uppercase">learning</span>}
                      </span>
                      <form action={deleteSkillAction}>
                        <input type="hidden" name="portfolioId" value={portfolio.id} />
                        <input type="hidden" name="id" value={skill.id} />
                        <input type="hidden" name="redirectTo" value={base} />
                        <button type="submit" className="text-[10px] text-muted/70 transition-colors hover:text-danger" aria-label={`Remove ${skill.name}`}>
                          remove
                        </button>
                      </form>
                    </li>
                  ))}
                  {skills.length === 0 && <li className="text-[11px] text-muted">No skills in this group.</li>}
                </ul>
              </div>
            );
          })}
        </div>

        <form action={saveSkillAction} className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line-strong p-4">
          <input type="hidden" name="portfolioId" value={portfolio.id} />
          <input type="hidden" name="redirectTo" value={base} />
          <Input label="Skill" name="name" placeholder="Prompt engineering" required className="min-w-[180px] flex-1" />
          <Input label="Group" name="group" placeholder="AI & LLM" list="skill-groups" className="min-w-[140px] flex-1" />
          <datalist id="skill-groups">
            {portfolio.skillGroups.map((group) => (
              <option key={group.id} value={group.name} />
            ))}
          </datalist>
          <label className="flex h-10 items-center gap-2 text-[11.5px] text-muted">
            <input type="checkbox" name="learning" className="size-4 accent-[#7DD3C0]" />
            Still learning
          </label>
          <SubmitButton size="sm" variant="secondary" pendingLabel="Adding…">Add skill</SubmitButton>
        </form>
      </section>

      {/* Achievements */}
      <section id="achievements" className="scroll-mt-6">
        <SectionHeading
          title="Achievements & certifications"
          count={portfolio.achievements.length + portfolio.certifications.length}
          hint="Only verified awards, hackathons, publications and certificates."
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {portfolio.certifications.map((certification) => (
            <div key={certification.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white/[0.02] p-4">
              <div>
                <p className="text-[12.5px] font-medium text-text">{certification.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {certification.issuer}
                  {certification.year ? ` · ${certification.year}` : ""}
                  {certification.learning ? " · in progress" : ""}
                </p>
              </div>
              <form action={deleteCertificationAction}>
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="id" value={certification.id} />
                <input type="hidden" name="redirectTo" value={base} />
                <button type="submit" className="text-[10px] text-muted/70 hover:text-danger" aria-label="Remove certification">remove</button>
              </form>
            </div>
          ))}
          {portfolio.achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white/[0.02] p-4">
              <div>
                <p className="text-[12.5px] font-medium text-text">{achievement.title}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {achievement.kind}
                  {achievement.year ? ` · ${achievement.year}` : ""}
                </p>
              </div>
              <form action={deleteAchievementAction}>
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="id" value={achievement.id} />
                <input type="hidden" name="redirectTo" value={base} />
                <button type="submit" className="text-[10px] text-muted/70 hover:text-danger" aria-label="Remove achievement">remove</button>
              </form>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <details className="rounded-xl border border-dashed border-line-strong">
            <summary className="cursor-pointer list-none px-4 py-3 text-[12px] text-mint">+ Add certification</summary>
            <form action={saveCertificationAction} className="space-y-4 border-t border-line p-4">
              <input type="hidden" name="portfolioId" value={portfolio.id} />
              <input type="hidden" name="redirectTo" value={base} />
              <Input label="Title" name="title" required />
              <Input label="Issuer" name="issuer" required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Year" name="year" />
                <Input label="Verification URL" name="url" type="url" />
              </div>
              <label className="flex items-center gap-2 text-[11.5px] text-muted">
                <input type="checkbox" name="learning" className="size-4 accent-[#7DD3C0]" />
                In progress
              </label>
              <SubmitButton size="sm" pendingLabel="Adding…">Add certification</SubmitButton>
            </form>
          </details>

          <details className="rounded-xl border border-dashed border-line-strong">
            <summary className="cursor-pointer list-none px-4 py-3 text-[12px] text-mint">+ Add achievement</summary>
            <form action={saveAchievementAction} className="space-y-4 border-t border-line p-4">
              <input type="hidden" name="portfolioId" value={portfolio.id} />
              <input type="hidden" name="redirectTo" value={base} />
              <Input label="Title" name="title" required />
              <Textarea label="Detail" name="detail" rows={2} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Year" name="year" />
                <Select label="Kind" name="kind" defaultValue="award">
                  {["award", "hackathon", "scholarship", "publication", "research", "membership", "other"].map((kind) => (
                    <option key={kind} value={kind}>{kind}</option>
                  ))}
                </Select>
              </div>
              <SubmitButton size="sm" pendingLabel="Adding…">Add achievement</SubmitButton>
            </form>
          </details>
        </div>
      </section>

      {/* Links */}
      <section id="links" className="scroll-mt-6">
        <SectionHeading title="Links & social" count={portfolio.socialLinks.length} hint="Shown in the contact section of every template." />
        <div className="flex flex-wrap gap-2">
          {portfolio.socialLinks.map((link) => (
            <span key={link.id} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[11.5px] text-text-2">
              <span className="font-medium">{link.label}</span>
              <span className="max-w-[200px] truncate font-mono text-[10px] text-muted">{link.url}</span>
              <form action={deleteSocialAction}>
                <input type="hidden" name="portfolioId" value={portfolio.id} />
                <input type="hidden" name="id" value={link.id} />
                <input type="hidden" name="redirectTo" value={base} />
                <button type="submit" className="text-muted/70 hover:text-danger" aria-label={`Remove ${link.label}`}>×</button>
              </form>
            </span>
          ))}
        </div>
        <form action={saveSocialAction} className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line-strong p-4">
          <input type="hidden" name="portfolioId" value={portfolio.id} />
          <input type="hidden" name="redirectTo" value={base} />
          <Input label="Label" name="label" placeholder="GitHub" required className="min-w-[140px]" />
          <Input label="URL" name="url" type="url" placeholder="https://github.com/you" required className="min-w-[220px] flex-1" />
          <SubmitButton size="sm" variant="secondary" pendingLabel="Adding…">Add link</SubmitButton>
        </form>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.02] px-5 py-4">
        <p className="text-[11.5px] text-muted">Changes to these sections appear immediately on your published page.</p>
        <Link href="/dashboard/preview" className={buttonClasses("secondary", "sm")}>Preview portfolio</Link>
      </div>
    </div>
  );
}

function SectionHeading({ title, count, hint }: { title: string; count: number; hint: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-[15px] font-medium tracking-[-0.01em]">{title}</h2>
        <p className="mt-0.5 text-[11px] text-muted">{hint}</p>
      </div>
      <span className="font-mono text-[9.5px] tracking-[0.08em] text-muted uppercase">{count} entries</span>
    </div>
  );
}
