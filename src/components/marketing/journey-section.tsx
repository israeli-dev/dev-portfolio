import { Section } from "@/components/ui/section";
interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  detail: string;
  kind: string;
}

const KIND_LABEL: Record<string, string> = {
  foundation: "Foundation",
  milestone: "Transition",
  building: "Building",
};

export function JourneySection({ entries }: { entries: TimelineEntry[] }) {
  if (!entries.length) return null;

  return (
    <Section
      id="journey"
      eyebrow="02 — Journey"
      title="From the field to the interface."
      description="Not a career history of titles — a record of the work that led here."
      bordered
    >
      <ol className="relative ml-1 border-l border-line md:ml-2">
        {entries.map((entry, index) => (
          <li key={entry.id} className="relative pb-10 pl-7 last:pb-0 md:pl-10">
            <span
              className={`absolute top-1 -left-[4.5px] size-[9px] rounded-full border-2 border-ink ${
                entry.kind === "building" ? "bg-mint" : entry.kind === "milestone" ? "bg-sand" : "bg-muted"
              }`}
              aria-hidden
            />
            <div className="grid gap-2 md:grid-cols-[130px_1fr] md:gap-8">
              <div className="flex items-center gap-2 md:flex-col md:items-start">
                <span className="font-mono text-[10.5px] tracking-[0.12em] text-muted uppercase">{entry.year}</span>
                <span className="font-mono text-[9px] tracking-[0.1em] text-muted/60 uppercase md:mt-1">
                  {KIND_LABEL[entry.kind] ?? entry.kind}
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-medium tracking-[-0.01em] text-text md:text-[17px]">{entry.title}</h3>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted md:text-[13.5px]">{entry.detail}</p>
              </div>
            </div>
            {index < entries.length - 1 && <span className="absolute bottom-0 left-0 h-px w-full" aria-hidden />}
          </li>
        ))}
      </ol>
    </Section>
  );
}
