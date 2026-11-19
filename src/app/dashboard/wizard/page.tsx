import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Circle, ExternalLink, Github, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getPortfolioForUser } from "@/lib/queries";
import { toPortfolioView } from "@/lib/portfolio-view";
import { PROFESSION_PRESETS, TEMPLATES, ACCENT_SWATCHES } from "@/lib/templates";
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from "@/lib/domain";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClasses } from "@/components/ui/button";
import { Flash } from "@/components/dashboard/flash";
import { CopyButton } from "@/components/ui/copy-button";
import { TemplateFrame } from "@/components/portfolio/template-frame";
import { PortfolioRenderer } from "@/components/portfolio/portfolio-renderer";
import {
  applyPresetAction,
  chooseTemplateAction,
  wizardAppearanceAction,
  wizardEducationAction,
  wizardExperienceAction,
  wizardGithubSyncAction,
  wizardProfileAction,
  wizardProjectAction,
  wizardPublishAction,
  wizardSkillsAction,
} from "@/app/actions/wizard";

const STEPS = [
  { n: 1, label: "Profession", hint: "Start from a preset" },
  { n: 2, label: "Template", hint: "Choose the layout" },
  { n: 3, label: "Profile", hint: "Who you are" },
  { n: 4, label: "Experience", hint: "Optional" },
  { n: 5, label: "Education", hint: "Optional" },
  { n: 6, label: "Skills", hint: "Optional" },
  { n: 7, label: "Projects", hint: "GitHub or manual" },
  { n: 8, label: "Design", hint: "Accent and type" },
  { n: 9, label: "Preview", hint: "Review the page" },
  { n: 10, label: "Publish", hint: "Go live" },
];

const GROUPS = ["Technology", "Business", "Academic & Research", "Creative", "Engineering & Industry"] as const;

export default async function WizardPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; saved?: string; error?: string; published?: string }>;
}) {
  const params = await searchParams;
  const rawStep = Number(params.step ?? "1");
  const step = Number.isFinite(rawStep) ? Math.min(10, Math.max(1, Math.trunc(rawStep))) : 1;

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/wizard");

  const portfolio = await getPortfolioForUser(user.id);
  if (!portfolio) redirect("/dashboard");
  const view = toPortfolioView(portfolio);

  const go = (n: number) => `/dashboard/wizard?step=${n}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
        <div>
          <p className="font-mono text-[9.5px] tracking-[0.14em] text-mint uppercase">Guided setup</p>
          <h1 className="mt-1.5 text-[24px] font-medium tracking-[-0.02em]">Portfolio builder</h1>
          <p className="mt-1.5 text-[12px] text-muted">
            Step {step} of 10 · everything can be edited later from the dashboard.
          </p>
        </div>
        <Link href="/dashboard" className={buttonClasses("ghost", "sm")}>
          Save & exit
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside>
          <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${(step / 10) * 100}%` }} />
          </div>
          <ol className="space-y-0.5">
            {STEPS.map((item) => {
              const active = item.n === step;
              const done = item.n < step;
              return (
                <li key={item.n}>
                  <Link
                    href={go(item.n)}
                    aria-current={active ? "step" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11.5px] transition-colors ${
                      active ? "bg-white/[0.06] text-text" : "text-muted hover:bg-white/[0.03] hover:text-text-2"
                    }`}
                  >
                    {done ? (
                      <Check className="size-3.5 shrink-0 text-mint" aria-hidden />
                    ) : active ? (
                      <span className="size-3.5 shrink-0 rounded-full border border-mint bg-mint/20" aria-hidden />
                    ) : (
                      <Circle className="size-3.5 shrink-0 text-muted/40" aria-hidden />
                    )}
                    <span className="flex-1">{item.label}</span>
                    <span className="font-mono text-[8.5px] opacity-50">0{item.n}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="min-w-0">
          <Flash message={params.error} tone="error" />
          <Flash message={params.saved} />
          {step === 10 && params.published === "true" && (
            <Flash message={`Published. Your portfolio is live at /u/${portfolio.slug}.`} />
          )}

          {step === 1 && (
            <Panel title="What do you do?" subtitle="A preset sets the layout, palette and typography. You can change all of it later.">
              {GROUPS.map((group) => (
                <div key={group} className="mb-5">
                  <p className="mb-2 font-mono text-[9px] tracking-[0.12em] text-muted uppercase">{group}</p>
                  <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {PROFESSION_PRESETS.filter((preset) => preset.group === group).map((preset) => (
                      <form key={preset.id} action={applyPresetAction}>
                        <input type="hidden" name="preset" value={preset.id} />
                        <button
                          type="submit"
                          className="group flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.015] px-3 py-2.5 text-left transition-colors hover:border-mint/35 hover:bg-white/[0.04]"
                        >
                          <span className="text-[11.5px] text-text-2 group-hover:text-text">{preset.label}</span>
                          <span className="flex items-center gap-1.5">
                            <span className="font-mono text-[8.5px] text-muted uppercase">{preset.template}</span>
                            <span className="size-1.5 rounded-full" style={{ background: preset.accent }} aria-hidden />
                          </span>
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
              <SkipLink href={go(2)} label="Skip — I'll choose a template manually" />
            </Panel>
          )}

          {step === 2 && (
            <Panel title="Choose a layout" subtitle="Four distinct layout engines. Colour and type are customisable in step 8.">
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((template) => {
                  const selected = portfolio.template === template.id;
                  return (
                    <form key={template.id} action={chooseTemplateAction} className="contents">
                      <input type="hidden" name="template" value={template.id} />
                      <button
                        type="submit"
                        aria-pressed={selected}
                        className={`group rounded-xl border p-4 text-left transition-colors ${
                          selected ? "border-mint/45 bg-mint/[0.04]" : "border-line bg-white/[0.015] hover:border-line-strong"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium">{template.name}</span>
                          <span className="size-2 rounded-full" style={{ background: template.defaultAccent }} aria-hidden />
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{template.description}</p>
                        <div className="mt-3 flex gap-1" aria-hidden>
                          {template.id === "signal" && (
                            <>
                              <span className="h-8 w-1/4 rounded-sm bg-white/10" />
                              <span className="h-8 flex-1 rounded-sm bg-white/[0.05]" />
                            </>
                          )}
                          {template.id === "monograph" && (
                            <span className="flex h-8 w-full flex-col justify-center gap-1 rounded-sm border border-white/10 px-1.5">
                              <span className="h-1 w-2/3 bg-white/25" />
                              <span className="h-1 w-1/2 bg-white/10" />
                            </span>
                          )}
                          {template.id === "atlas" && (
                            <>
                              <span className="h-8 flex-1 rounded-sm bg-white/[0.08]" />
                              <span className="h-8 w-1/3 rounded-sm bg-white/[0.05]" />
                            </>
                          )}
                          {template.id === "terminal" && (
                            <span className="flex h-8 w-full flex-col justify-center gap-1 rounded-sm bg-black/40 px-1.5 font-mono">
                              <span className="h-1 w-3/4 bg-white/20" />
                              <span className="h-1 w-1/2 bg-white/10" />
                              <span className="h-1 w-2/3 bg-white/[0.07]" />
                            </span>
                          )}
                        </div>
                        <p className="mt-3 font-mono text-[8.5px] tracking-[0.08em] text-muted uppercase">
                          {selected ? "Currently applied" : template.layout}
                        </p>
                      </button>
                    </form>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <BackLink href={go(1)} />
                <SkipLink href={go(3)} label="Keep current template" />
              </div>
            </Panel>
          )}

          {step === 3 && (
            <Panel title="Your profile" subtitle="This is what visitors read first. Write it in your own words.">
              <form action={wizardProfileAction} className="space-y-4">
                <Input label="Portfolio title" name="title" defaultValue={portfolio.title} required hint="Often your name, or name + role." />
                <Input
                  label="Headline"
                  name="headline"
                  defaultValue={portfolio.headline}
                  maxLength={160}
                  placeholder="AI engineer building tools for scientific data"
                  hint="One sentence describing what you do."
                />
                <Textarea
                  label="About"
                  name="bio"
                  defaultValue={portfolio.bio}
                  rows={6}
                  maxLength={1200}
                  placeholder="Where you started, what you build, and what you are looking for."
                  hint="Two or three short paragraphs is plenty."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Location" name="location" defaultValue={portfolio.location} placeholder="City, Country" />
                  <Input label="Contact email" name="email" type="email" defaultValue={portfolio.email} placeholder="you@example.com" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Availability" name="availability" defaultValue={portfolio.availability} placeholder="Open to new roles" />
                  <Input label="Avatar URL" name="avatarUrl" defaultValue={portfolio.avatarUrl ?? ""} placeholder="https://… (optional)" hint="Or upload from the profile page later." />
                </div>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <BackLink href={go(2)} />
                  <SubmitButton pendingLabel="Saving…">Save & continue</SubmitButton>
                </div>
              </form>
            </Panel>
          )}

          {step === 4 && (
            <Panel title="Experience" subtitle="Optional. Add one entry now — you can add more, or remove them, from the content editor.">
              <form action={wizardExperienceAction} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Role" name="role" placeholder="Field geologist" />
                  <Input label="Organisation" name="organization" placeholder="Organisation or independent practice" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Start" name="startDate" placeholder="2023" />
                  <Input label="End" name="endDate" placeholder="Leave blank if current" />
                  <Input label="Location" name="location" placeholder="City, Country" />
                </div>
                <Textarea label="Summary" name="summary" rows={3} maxLength={1200} placeholder="What you were responsible for, in plain language." />
                <Input label="Technologies" name="tech" placeholder="Python, GIS, Field mapping" hint="Comma separated." />
                <label className="flex items-center gap-2 text-[12px] text-text-2">
                  <input type="checkbox" name="current" className="size-4 accent-[#7DD3C0]" />
                  This is my current role
                </label>
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <BackLink href={go(3)} />
                  <div className="flex items-center gap-3">
                    <SkipLink href={go(5)} label="Skip" />
                    <SubmitButton pendingLabel="Saving…">Save & continue</SubmitButton>
                  </div>
                </div>
              </form>
            </Panel>
          )}

          {step === 5 && (
            <Panel title="Education" subtitle="Optional. Only add what is accurate — institutions verify these.">
              <form action={wizardEducationAction} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Degree / programme" name="degree" placeholder="B.Sc. Geology" />
                  <Input label="Institution" name="institution" placeholder="University name" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Graduation year" name="year" placeholder="2023" />
                  <Input label="Location" name="location" placeholder="City, Country" />
                </div>
                <Textarea label="Relevant detail" name="detail" rows={3} maxLength={1200} placeholder="Coursework, thesis or notable projects." />
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <BackLink href={go(4)} />
                  <div className="flex items-center gap-3">
                    <SkipLink href={go(6)} label="Skip" />
                    <SubmitButton pendingLabel="Saving…">Save & continue</SubmitButton>
                  </div>
                </div>
              </form>
            </Panel>
          )}

          {step === 6 && (
            <Panel title="Skills" subtitle="Optional. Group them meaningfully — one line per skill.">
              <form action={wizardSkillsAction} className="space-y-4">
                <Input label="Group name" name="group" defaultValue="Core" placeholder="AI & LLM" hint="e.g. Programming, Backend, Geoscience." />
                <Textarea
                  label="Skills"
                  name="skills"
                  rows={6}
                  placeholder={"Python\nFastAPI\nPrompt engineering\nPostgreSQL"}
                  hint="One per line, or comma separated. Do not include skills you cannot demonstrate."
                />
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <BackLink href={go(5)} />
                  <div className="flex items-center gap-3">
                    <SkipLink href={go(7)} label="Skip" />
                    <SubmitButton pendingLabel="Saving…">Save & continue</SubmitButton>
                  </div>
                </div>
              </form>
            </Panel>
          )}

          {step === 7 && (
            <Panel title="Projects" subtitle="Import from GitHub or add one project manually. Status is shown honestly on your public page.">
              <div className="rounded-xl border border-line bg-ink p-4">
                <div className="flex items-center gap-2">
                  <Github className="size-4 text-text-2" aria-hidden />
                  <p className="text-[12.5px] font-medium">Import public repositories</p>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Uses the official GitHub API. Descriptions and languages come from the repositories; nothing is invented.
                </p>
                <form action={wizardGithubSyncAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <Input label="GitHub username" name="username" defaultValue={portfolio.github?.username ?? ""} placeholder="octocat" className="min-w-[220px] flex-1" />
                  <SubmitButton variant="secondary" pendingLabel="Syncing…">
                    Sync repositories
                  </SubmitButton>
                </form>
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="font-mono text-[8.5px] tracking-[0.1em] text-muted uppercase">or add manually</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <form action={wizardProjectAction} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Project name" name="name" placeholder="Prospect Atlas" />
                  <Input label="One-line description" name="tagline" maxLength={160} placeholder="What it does, in one line." />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Category" name="category" defaultValue="web-applications">
                    {PROJECT_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </Select>
                  <Select label="Status" name="status" defaultValue="in-development">
                    {PROJECT_STATUSES.filter((status) => ["live", "completed", "in-development", "experimental", "planned"].includes(status.id)).map((status) => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Repository URL" name="repoUrl" placeholder="https://github.com/you/project" />
                  <Input label="Live demo URL" name="demoUrl" placeholder="https://project.example.com" />
                </div>
                <Input label="Stack" name="stack" placeholder="TypeScript, React, PostgreSQL" hint="Comma separated." />
                <div className="flex items-center justify-between border-t border-line pt-4">
                  <BackLink href={go(6)} />
                  <div className="flex items-center gap-3">
                    <SkipLink href={go(8)} label="Skip" />
                    <SubmitButton pendingLabel="Saving…">Save & continue</SubmitButton>
                  </div>
                </div>
              </form>

              {portfolio.projects.length > 0 && (
                <p className="mt-4 font-mono text-[9.5px] tracking-[0.06em] text-muted uppercase">
                  {portfolio.projects.length} project(s) already in your portfolio
                </p>
              )}
            </Panel>
          )}

          {step === 8 && (
            <Panel title="Design" subtitle="One accent colour, one type pairing, one appearance. Restraint is the point.">
              <form action={wizardAppearanceAction} className="space-y-5">
                <Select label="Template" name="template" defaultValue={portfolio.template}>
                  {TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>{template.name} — {template.layout}</option>
                  ))}
                </Select>

                <fieldset>
                  <legend className="mb-2 text-[12.5px] font-medium text-text-2">Accent colour</legend>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_SWATCHES.map((color) => (
                      <label key={color} className="cursor-pointer">
                        <input type="radio" name="accent" value={color} defaultChecked={portfolio.accent === color} className="peer sr-only" />
                        <span
                          className="flex size-8 items-center justify-center rounded-full border-2 border-transparent ring-1 ring-white/15 transition-all peer-checked:border-ink peer-checked:ring-2 peer-checked:ring-mint"
                          style={{ background: color }}
                          aria-hidden
                        />
                        <span className="sr-only">{color}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Typeface" name="fontStyle" defaultValue={portfolio.fontStyle}>
                    <option value="sans">Geist Sans — modern, neutral</option>
                    <option value="serif">Geist Serif — editorial</option>
                    <option value="mono">Geist Mono — technical</option>
                  </Select>
                  <Select label="Appearance" name="appearance" defaultValue={portfolio.appearance}>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </Select>
                </div>

                <div>
                  <p className="mb-2 text-[12.5px] font-medium text-text-2">Current preview</p>
                  <TemplateFrame height="220px" scale="0.26" label="Current design preview">
                    <PortfolioRenderer view={view} />
                  </TemplateFrame>
                </div>

                <div className="flex items-center justify-between border-t border-line pt-4">
                  <BackLink href={go(7)} />
                  <SubmitButton pendingLabel="Saving…">Save & preview</SubmitButton>
                </div>
              </form>
            </Panel>
          )}

          {step === 9 && (
            <Panel title="Preview" subtitle="This is the exact template that will publish, rendered from your real content.">
              <TemplateFrame height="420px" scale="0.4" label="Portfolio preview">
                <PortfolioRenderer view={view} />
              </TemplateFrame>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <BackLink href={go(8)} />
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/preview" className={buttonClasses("secondary", "md")}>
                    Open full preview
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                  <Link href={go(10)} className={buttonClasses("primary", "md")}>
                    Continue to publish
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </Panel>
          )}

          {step === 10 && (
            <Panel title="Publish" subtitle="Publishing makes the sections you enabled readable by anyone with the link.">
              <div className="rounded-xl border border-line bg-ink p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase">Public URL</p>
                    <p className="mt-1.5 font-mono text-[13px] text-text">/u/{portfolio.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {portfolio.published ? (
                      <>
                        <CopyButton value={`/u/${portfolio.slug}`} label="Copy URL" />
                        <Link href={`/u/${portfolio.slug}`} className={buttonClasses("secondary", "sm")}>
                          Open page
                          <ExternalLink className="size-3.5" aria-hidden />
                        </Link>
                      </>
                    ) : (
                      <form action={wizardPublishAction}>
                        <input type="hidden" name="published" value="true" />
                        <SubmitButton pendingLabel="Publishing…">
                          <Sparkles className="size-3.5" aria-hidden />
                          Publish my portfolio
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-2 border-t border-line pt-4 text-[11.5px] text-muted">
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-mint" aria-hidden /> Sections set to public: {view.sections.filter((section) => section.visible).length} of {view.sections.length}</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-mint" aria-hidden /> Projects visible: {view.projects.length}</p>
                  <p className="flex items-center gap-2"><Check className="size-3.5 text-mint" aria-hidden /> Contact inbox active</p>
                </div>

                {portfolio.published && (
                  <form action={wizardPublishAction} className="mt-4">
                    <input type="hidden" name="published" value="false" />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="Unpublishing…">Unpublish</SubmitButton>
                  </form>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <BackLink href={go(9)} />
                <Link href="/dashboard" className={buttonClasses("primary", "md")}>
                  Go to dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.015] p-5 md:p-6">
      <h2 className="text-[17px] font-medium tracking-[-0.015em]">{title}</h2>
      <p className="mt-1.5 mb-5 text-[12px] leading-relaxed text-muted">{subtitle}</p>
      {children}
    </div>
  );
}

function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-text">
      <ArrowLeft className="size-3.5" aria-hidden />
      Back
    </Link>
  );
}

function SkipLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-text">
      {label}
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}
