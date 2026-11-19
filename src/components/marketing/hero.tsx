import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Github, Mail, MapPin, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { OWNER } from "@/content/personal";
import type { PortfolioView } from "@/lib/portfolio-view";

interface HeroProps {
  view: PortfolioView;
  repoCount: number;
  deployedCount: number;
  avatarUrl?: string | null;
}

export function Hero({ view, repoCount, deployedCount, avatarUrl }: HeroProps) {
  const name = "Israel Kolawole";

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 grid-lines" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.13] blur-[110px]"
        style={{ background: "radial-gradient(circle, #E0A458 0%, transparent 68%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-[0.10] blur-[100px]"
        style={{ background: "radial-gradient(circle, #7DD3C0 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="shell relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 lg:py-28">
        <div className="animate-rise">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/[0.07] px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-mint uppercase">
              <span className="status-dot animate-[pulseSoft_3.6s_ease-in-out_infinite] bg-mint" aria-hidden />
              Available for AI engineering roles
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.08em] text-muted uppercase">
              <MapPin className="size-3" aria-hidden />
              {OWNER.location}
            </span>
          </div>

          <h1 className="mt-7 text-[44px] leading-[0.98] font-medium tracking-[-0.045em] sm:text-[58px] lg:text-[68px]">
            <span className="block text-text">Israel</span>
            <span className="block text-gradient">Kolawole</span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-text-2 md:text-[16.5px]">
            <span className="text-text">AI engineer and geoscientist.</span> I build applications where LLMs meet
            subsurface data, scientific documents and the operational reality of the field.
          </p>

          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
            Currently building applied AI systems in Python, FastAPI and TypeScript — each one deployed, documented and
            honest about what it does not yet do.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Link href="#work" className={buttonClasses("primary", "lg")}>
              Explore my work
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="#contact" className={buttonClasses("secondary", "lg")}>
              <Mail className="size-4" aria-hidden />
              Contact me
            </Link>
            <a
              href={OWNER.github}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("ghost", "lg")}
              aria-label="Israel Kolawole on GitHub"
            >
              <Github className="size-4" aria-hidden />
              GitHub
              <ArrowUpRight className="size-3.5 opacity-60" aria-hidden />
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
            {[
              { label: "Public repositories", value: repoCount, suffix: "" },
              { label: "Deployed apps", value: deployedCount, suffix: "" },
              { label: "Last synced", value: "GitHub", suffix: "" },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink-2/80 px-4 py-4 backdrop-blur">
                <dt className="font-mono text-[9.5px] tracking-[0.1em] text-muted uppercase">{stat.label}</dt>
                <dd className="mt-1.5 text-[19px] font-medium tracking-[-0.02em] text-text">
                  {stat.value}
                  {stat.suffix}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2.5 font-mono text-[9.5px] tracking-[0.06em] text-muted/80 uppercase">
            Counts derived from public GitHub metadata — not marketing figures
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[420px] animate-fade lg:mx-0">
          <PortraitPlate avatarUrl={avatarUrl ?? view.avatarUrl} name={name} />
        </div>
      </div>
    </section>
  );
}

/**
 * Portrait plate. Uses the owner's uploaded image when present; otherwise an
 * intentional monogram built from strata lines — a replaceable placeholder,
 * not a stock photograph.
 */
function PortraitPlate({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-[28px] border border-line/70" aria-hidden />
      <div className="relative overflow-hidden rounded-[22px] border border-line-strong bg-surface">
        <div className="relative aspect-[4/5] w-full">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill sizes="420px" className="object-cover" priority />
          ) : (
            <div className="relative size-full bg-[radial-gradient(circle_at_30%_20%,#1c2626_0%,#0c1013_55%,#080a0c_100%)]">
              <svg viewBox="0 0 400 500" className="absolute inset-0 size-full" aria-hidden>
                <defs>
                  <linearGradient id="strata" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7DD3C0" stopOpacity="0.55" />
                    <stop offset="55%" stopColor="#E0A458" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7DD3C0" stopOpacity="0.12" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((line) => (
                  <path
                    key={line}
                    d={`M-20 ${250 + line * 34} C 90 ${210 + line * 34}, 170 ${310 + line * 34}, 420 ${236 + line * 34}`}
                    stroke="url(#strata)"
                    strokeWidth={line === 3 ? 1.4 : 0.8}
                    fill="none"
                    opacity={0.85 - line * 0.08}
                  />
                ))}
                <circle cx="200" cy="190" r="118" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" fill="none" strokeDasharray="2 6" />
                <circle cx="200" cy="190" r="88" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none" />
                <path d="M200 52v34M200 294v34M62 190h34M304 190h34" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[9.5px] tracking-[0.24em] text-mint/70 uppercase">Profile image</span>
                <span className="mt-4 text-[76px] leading-none font-medium tracking-[-0.06em] text-text/90">IK</span>
                <span className="mt-5 h-px w-14 bg-gradient-to-r from-transparent via-sand/60 to-transparent" />
                <span className="mt-4 max-w-[210px] text-center font-mono text-[9px] leading-relaxed tracking-[0.12em] text-muted uppercase">
                  Replace in admin → profile
                </span>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent px-5 pt-14 pb-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] tracking-[0.18em] text-mint/80 uppercase">Field → Model</p>
                <p className="mt-1 text-[14px] font-medium text-text">{name}</p>
                <p className="mt-0.5 text-[11px] text-muted">{OWNER.shortTitle}</p>
              </div>
              <Sparkles className="size-4 text-sand/70" aria-hidden />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1 font-mono text-[9.5px] tracking-[0.1em] text-muted uppercase">
        <span>7.3775° N, 3.9470° E</span>
        <span className="text-mint/70">● building</span>
      </div>
    </div>
  );
}
