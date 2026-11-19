import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { getCurrentUser } from "@/lib/session";

const LINKS = [
  { href: "/projects", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/templates", label: "Templates" },
  { href: "/#contact", label: "Contact" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/78 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden h-5 w-px bg-line-strong sm:block" aria-hidden />
          <Link
            href="/"
            className="hidden text-[12.5px] tracking-[0.01em] text-muted transition-colors hover:text-text-2 sm:block"
          >
            Israel Kolawole
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-[13px] text-text-2 transition-colors hover:bg-white/[0.04] hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === "OWNER" && (
                <Link href="/admin" className={buttonClasses("ghost", "sm")}>
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className={buttonClasses("primary", "sm")}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClasses("ghost", "sm")}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonClasses("primary", "sm")}>
                Build your portfolio
              </Link>
            </>
          )}
        </div>

        <MobileNav links={LINKS} signedIn={Boolean(user)} isOwner={user?.role === "OWNER"} />
      </div>
    </header>
  );
}
