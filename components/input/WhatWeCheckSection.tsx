import { DOCUMENT_CHECKS } from "@/components/input/analyzeContent";
import type { DocumentType } from "@/lib/types";

interface WhatWeCheckSectionProps {
  documentType: DocumentType | null;
}

export function WhatWeCheckSection({ documentType }: WhatWeCheckSectionProps) {
  if (!documentType) return null;

  const items = DOCUMENT_CHECKS[documentType];

  return (
    <section className="rounded-[1.5rem] border border-[#e6dccd] bg-[#f5f0e8] px-5 py-4 md:px-6">
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#c8791a]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        What we check
      </p>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <svg
              className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[#c8791a]"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 7.5 5.5 11 12 3" />
            </svg>
            <span className="text-sm leading-snug text-[#4a3d2e]">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
