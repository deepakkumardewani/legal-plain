import Link from "next/link";
import Image from "next/image";

export function AnalyzeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e6dccd] bg-[#fbf8f1]/95 px-5 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-[#6b6558] transition-colors duration-200 hover:bg-[#f0ebe4] hover:text-[#18181f]"
          aria-label="Back to home"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>

        <div className="h-4 w-px bg-[#e0d8cc]" aria-hidden />

        <Link href="/" className="group flex items-center gap-2.5" aria-label="LegalPlain home">
          <Image
            src="/logo.svg"
            alt="LegalPlain Logo"
            width={28}
            height={28}
            className="transition-transform duration-200 group-hover:-rotate-6 rounded-full"
          />
          <span
            className="text-base font-semibold tracking-tight text-[#18181f]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LegalPlain
          </span>
        </Link>
      </div>
    </header>
  );
}
