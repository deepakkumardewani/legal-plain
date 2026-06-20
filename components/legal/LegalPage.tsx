import Image from "next/image";
import Link from "next/link";

import { fontVariables } from "@/lib/fonts";
import { LandingFooter } from "@/components/landing/LandingFooter";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: readonly LegalSection[];
}

export function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div
      className={`${fontVariables} min-h-screen bg-background text-foreground`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="sticky top-0 z-50 border-b border-outline-warm bg-background/90 px-5 py-3 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="LexLight Logo"
              width={32}
              height={32}
              className="rounded-full transition-transform duration-200 group-hover:-rotate-6"
            />
            <span
              className="text-lg font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LexLight
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-on-surface-variant transition-all duration-200 hover:bg-surface-warm hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <h1
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant/70">Last updated: {lastUpdated}</p>
        <p className="mt-6 text-base leading-relaxed text-on-surface-variant">{intro}</p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2
                className="text-xl font-semibold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[0.9375rem] leading-relaxed text-on-surface-variant"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
