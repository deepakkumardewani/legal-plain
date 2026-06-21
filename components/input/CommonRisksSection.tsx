import { COMMON_RISKS } from "@/components/input/analyzeContent";
import type { DocumentType } from "@/lib/types";

interface CommonRisksSectionProps {
  documentType: DocumentType | null;
}

export function CommonRisksSection({ documentType }: CommonRisksSectionProps) {
  if (!documentType) return null;

  const items = COMMON_RISKS[documentType];

  return (
    <section className="rounded-[1.5rem] border border-[#e6dccd] bg-[#f5f0e8] px-5 py-4 md:px-6">
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#c8791a]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Common risks we flag
      </p>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <svg
              className="mt-[2px] h-3.5 w-3.5 shrink-0 text-[#c8791a]"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 1.5 13 12.5H1z" />
              <path d="M7 5.5v3" />
              <path d="M7 10.5h.01" />
            </svg>
            <span className="text-sm leading-snug text-[#4a3d2e]">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
