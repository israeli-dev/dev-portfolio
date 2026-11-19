import { Section } from "@/components/ui/section";
import type { SkillGroupView } from "@/lib/portfolio-view";

const GROUP_ICONS: Record<string, string> = {
  "AI & LLM": "AI",
  Programming: "PY",
  "Backend & data": "API",
  Frontend: "UI",
  Tooling: "OPS",
  Geoscience: "GEO",
};

export function SkillsSection({ groups }: { groups: SkillGroupView[] }) {
  if (!groups.length) return null;

  return (
    <Section
      id="skills"
      eyebrow="03 — Capability"
      title="What I can actually do."
      description="Skills matched to shipped work. Anything still being learned is labelled instead of overstated."
      bordered
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.name} className="group bg-ink p-6 transition-colors hover:bg-surface">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-medium text-text">{group.name}</h3>
              <span className="font-mono text-[10px] tracking-[0.1em] text-muted/70">
                {GROUP_ICONS[group.name] ?? "—"}
              </span>
            </div>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => (
                <li
                  key={skill.name}
                  className={
                    skill.learning
                      ? "rounded-md border border-dashed border-line-strong bg-transparent px-2 py-1 text-[11.5px] text-muted"
                      : "rounded-md border border-line bg-white/[0.03] px-2 py-1 text-[11.5px] text-text-2"
                  }
                >
                  {skill.name}
                  {skill.learning && <span className="ml-1.5 font-mono text-[9px] tracking-[0.08em] uppercase">learning</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-5 font-mono text-[10px] tracking-[0.08em] text-muted/80 uppercase">
        Dashed items are in progress · no proficiency percentages invented
      </p>
    </Section>
  );
}
