import Link from "next/link";

export function AnalyzeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#24231f] bg-[#0f100e]/92 px-5 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="LegalPlain home">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-[#c8791a]/35 bg-[#c8791a]/12 text-sm font-bold text-[#e0a14a] transition-transform duration-200 group-hover:-rotate-6">
            LP
          </span>
          <span
            className="text-lg font-semibold tracking-tight text-[#f7efe2]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LegalPlain
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-full border border-[#302e28] bg-[#171713]/70 px-4 py-2 text-sm font-medium text-[#b7ad9d] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#4a3d2d] hover:text-[#f7efe2]"
        >
          Back to home
        </Link>
      </div>
    </header>
  );
}
