import Image from "next/image";

const NAV_ITEMS = [
  { href: "#documents", label: "Documents" },
  { href: "#method", label: "Method" },
  { href: "#privacy", label: "Privacy" },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2924]/80 bg-[#0f100e]/88 px-5 py-3 backdrop-blur-xl md:px-8">
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
            className="text-lg font-semibold tracking-tight text-[#f7efe2]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LexLight
          </span>
        </a>

        <nav
          className="hidden items-center rounded-full border border-[#302e28] bg-[#171713]/70 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex"
          aria-label="Landing page sections"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#b7ad9d] transition-all duration-200 hover:bg-[#24221d] hover:text-[#f7efe2]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
