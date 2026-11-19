import { Github, Linkedin, Mail, MapPin } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/marketing/contact-form";
import { OWNER } from "@/content/personal";

export function ContactSection({ email, socialLinks }: { email: string; socialLinks: { label: string; url: string }[] }) {
  const linkedin = socialLinks.find((link) => link.label.toLowerCase() === "linkedin")?.url ?? OWNER.linkedin;
  const github = socialLinks.find((link) => link.label.toLowerCase() === "github")?.url ?? OWNER.github;
  const displayEmail = email || OWNER.email;

  return (
    <Section
      id="contact"
      eyebrow="06 — Contact"
      title="Have a problem worth building for?"
      description="Open to AI engineering roles, applied geoscience software work and collaborations where the data is real and the outcome matters."
      bordered
    >
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="space-y-3">
          <a
            href={`mailto:${displayEmail}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-line-strong hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-ink text-mint">
                <Mail className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">Email</span>
                <span className="mt-0.5 block text-[13px] text-text-2">{displayEmail}</span>
              </span>
            </span>
            <span className="font-mono text-[10px] text-muted transition-colors group-hover:text-mint">→</span>
          </a>

          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-line-strong hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-ink text-text-2">
                <Github className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">GitHub</span>
                <span className="mt-0.5 block text-[13px] text-text-2">github.com/israeli-dev</span>
              </span>
            </span>
            <span className="font-mono text-[10px] text-muted transition-colors group-hover:text-mint">↗</span>
          </a>

          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-line-strong hover:bg-white/[0.04]"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-ink text-sky">
                  <Linkedin className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">LinkedIn</span>
                  <span className="mt-0.5 block text-[13px] text-text-2">Professional profile</span>
                </span>
              </span>
              <span className="font-mono text-[10px] text-muted transition-colors group-hover:text-mint">↗</span>
            </a>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-line p-4">
              <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-ink text-muted">
                <Linkedin className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">LinkedIn</span>
                <span className="mt-0.5 block text-[11.5px] text-muted">Link not added yet — email is the reliable route.</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-4">
            <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-ink text-sand">
              <MapPin className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block font-mono text-[9.5px] tracking-[0.12em] text-muted uppercase">Location</span>
              <span className="mt-0.5 block text-[13px] text-text-2">{OWNER.location} · remote-friendly</span>
            </span>
          </div>
        </div>

        <div className="panel p-6 md:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
