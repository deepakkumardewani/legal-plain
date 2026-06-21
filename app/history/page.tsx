import Link from "next/link";
import Image from "next/image";
import { fontVariables } from "@/lib/fonts";
import { HistoryList } from "@/components/history/HistoryList";

export const metadata = { title: "History – LexLight" };

export default function HistoryPage() {
  return (
    <div
      className={`${fontVariables} min-h-screen bg-[#fbf8f1] text-[#18181f]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="sticky top-0 z-40 border-b border-[#e6dccd] bg-[#fbf8f1]/95 px-5 py-3 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/analyze"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-[#6b6558] transition-colors duration-150 hover:bg-[#f0ebe4] hover:text-[#18181f]"
              aria-label="Back to analyze"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </Link>

            <div className="h-4 w-px bg-[#ddd5c8]" aria-hidden />

            <Link href="/" className="group flex items-center gap-2" aria-label="LexLight home">
              <Image
                src="/logo.svg"
                alt="LexLight Logo"
                width={26}
                height={26}
                className="rounded-full transition-transform duration-200 group-hover:-rotate-6"
              />
              <span
                className="text-[15px] font-semibold tracking-tight text-[#18181f]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LexLight
              </span>
            </Link>
          </div>

          <Link
            href="/analyze"
            className="rounded-md border border-[#e0d8cc] bg-[#fffdf8] px-3 py-1.5 text-sm font-medium text-[#6b6558] transition-all duration-150 hover:border-[#c8791a]/40 hover:bg-[#fff8f0] hover:text-[#18181f]"
          >
            New analysis
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pt-10 pb-16 md:px-8 md:pt-12">
        <h1
          className="text-[28px] font-semibold tracking-[-0.02em] text-[#18181f]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Analysis history
        </h1>
        <p className="mt-1.5 text-sm text-[#6b6558]">
          Revisit past analyses — reopen, rename, or remove them.
        </p>

        <div className="mt-8">
          <HistoryList />
        </div>
      </main>
    </div>
  );
}
