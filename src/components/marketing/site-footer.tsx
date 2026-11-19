import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { OWNER } from "@/content/personal";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
              A portfolio platform with real publishing, real GitHub sync and templates that actually differ. Built by{" "}
              {OWNER.name}.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={OWNER.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="rounded-md border border-line p-2 text-muted transition-colors hover:border-line-strong hover:text-text"
              >
                <Github className="size-4" aria-hidden />
              </a>
              {OWNER.linkedin && (
                <a
                  href={OWNER.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="rounded-md border border-line p-2 text-muted transition-colors hover:border-line-strong hover:text-text"
                >
                  <Linkedin className="size-4" aria-hidden />
                </a>
              )}
              <a
                href="#contact"
                aria-label="Contact"
                className="rounded-md border border-line p-2 text-muted transition-colors hover:border-line-strong hover:text-text"
              >
                <Mail className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <nav aria-label="Portfolio">
            <p className="eyebrow mb-3">Portfolio</p>
            <ul className="space-y-2 text-[13px] text-text-2">
              <li><Link className="link-underline" href="/projects">Selected work</Link></li>
              <li><Link className="link-underline" href="/#about">About</Link></li>
              <li><Link className="link-underline" href="/#journey">Journey</Link></li>
              <li><Link className="link-underline" href="/#contact">Contact</Link></li>
            </ul>
          </nav>

          <nav aria-label="Platform">
            <p className="eyebrow mb-3">Platform</p>
            <ul className="space-y-2 text-[13px] text-text-2">
              <li><Link className="link-underline" href="/templates">Templates</Link></li>
              <li><Link className="link-underline" href="/signup">Create an account</Link></li>
              <li><Link className="link-underline" href="/login">Sign in</Link></li>
              <li><Link className="link-underline" href="/u/israel-kolawole">Example public page</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[11.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {OWNER.name}. Project information sourced from public repositories.</p>
          <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase">
            Folio v1.0 · Next.js · Prisma
          </p>
        </div>
      </div>
    </footer>
  );
}
