import { Check } from "lucide-react";

import { WHY_AI_ROWS } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

export function WhyAiReviewSection() {
  return (
    <section className="px-5 py-24 md:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          eyebrow="Why AI-powered review"
          title="Fast, free, and private."
          body="Most people sign standard contracts without professional review — cost and scheduling make it impractical. LexLight removes that barrier without replacing a lawyer for high-stakes decisions."
        />

        <div className="mt-16 overflow-x-auto rounded-[1.75rem] border border-outline-warm bg-surface shadow-[0_4px_32px_-8px_rgba(74,55,31,0.08)]">
          <table
            className="w-full min-w-[560px] text-sm"
            aria-label="LexLight vs traditional review comparison"
          >
            <thead>
              <tr className="border-b border-outline-warm bg-surface-warm">
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                >
                  LexLight
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
                >
                  Traditional review
                </th>
              </tr>
            </thead>
            <tbody>
              {WHY_AI_ROWS.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? "bg-surface" : "bg-surface-warm/40"}>
                  <td className="px-6 py-4 font-medium text-foreground">{row.feature}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-success">
                      <Check size={14} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
                      {row.lexlight}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-on-surface-variant/70">
          Cost and timing figures are estimates: review times are based on typical contracts, and
          cost comparisons reference average U.S. attorney rates. Individual results vary. LexLight
          provides educational information only, not legal advice — for matters of significant
          consequence, consult a licensed attorney in your jurisdiction.
        </p>
      </div>
    </section>
  );
}
