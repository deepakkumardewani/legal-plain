import { KEY_TAKEAWAYS } from "@/components/input/analyzeContent";
import type { DocumentType } from "@/lib/types";

interface KeyTakeawaysSectionProps {
  documentType: DocumentType | null;
}

export function KeyTakeawaysSection({ documentType }: KeyTakeawaysSectionProps) {
  if (!documentType) return null;

  const items = KEY_TAKEAWAYS[documentType];

  return (
    <section className="rounded-[1.5rem] border border-[#e6dccd] bg-[#f5f0e8] px-5 py-5 md:px-6">
      <div className="mb-3 flex items-center gap-2">
        <svg
          className="h-4 w-4 shrink-0 text-[#c8791a]"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <circle cx="8" cy="8" r="6.25" />
          <circle cx="8" cy="8" r="2.5" />
        </svg>
        <p
          className="text-[11px] font-semibold uppercase tracking-widest text-[#c8791a]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Key takeaways
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
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
            <span className="text-[15px] leading-snug text-[#4a3d2e]">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
