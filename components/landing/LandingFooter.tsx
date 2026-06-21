import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-outline-warm bg-surface-warm px-5 py-12 text-center md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <span
            className="text-lg font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LexLight
          </span>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
          LexLight provides general educational information only, not legal advice. No
          attorney-client relationship is formed by using this tool. The analysis may contain errors
          and does not account for all applicable laws. Do not rely on this analysis alone to make
          legal decisions. For matters of significant consequence, consult a licensed attorney in
          your jurisdiction.
        </p>
        <nav
          className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          aria-label="Legal"
        >
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-on-surface-variant transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-on-surface-variant/70">© {new Date().getFullYear()} LexLight.</p>
      </div>
    </footer>
  );
}
