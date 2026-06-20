import Image from "next/image";

const NAV_ITEMS = [
  { href: "#documents", label: "Documents" },
  { href: "#method", label: "Method" },
  { href: "#privacy", label: "Privacy" },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-warm bg-background/90 px-5 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <a href="#" className="group flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="LexLight Logo"
            width={32}
            height={32}
            className="transition-transform duration-200 group-hover:-rotate-6 rounded-full"
          />
          <span
            className="text-lg font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LexLight
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing page sections">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-all duration-200 hover:bg-surface-warm hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#analyze"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_4px_16px_-4px_rgba(200,121,26,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Analyze my document
        </a>
      </div>
    </header>
  );
}
