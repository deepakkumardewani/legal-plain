import { DOCUMENT_TYPES } from "@/components/input/analyzeContent";
import { StepHeading } from "@/components/input/StepHeading";
import type { DocumentType } from "@/lib/types";

interface DocumentTypeSectionProps {
  value: DocumentType | null;
  onChange: (documentType: DocumentType) => void;
}

export function DocumentTypeSection({ value, onChange }: DocumentTypeSectionProps) {
  return (
    <section className="ap-rise ap-d3">
      <StepHeading
        num="02"
        title="Confirm the document type"
        hint="This keeps the analysis focused on the clauses that matter for this agreement."
      />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DOCUMENT_TYPES.map((documentType) => {
          const selected = value === documentType.value;

          return (
            <button
              key={documentType.value}
              type="button"
              onClick={() => onChange(documentType.value)}
              className={`group flex min-h-[150px] flex-col items-start rounded-[1.25rem] border px-4 py-4 text-left transition-all duration-300 ${
                selected
                  ? "border-[#c8791a] bg-[#fff8f0] shadow-[0_18px_54px_-44px_rgba(200,121,26,0.9)] ring-2 ring-[#c8791a]/18"
                  : "border-[#e0d6c8] bg-[#fffdf8] hover:-translate-y-0.5 hover:border-[#c8791a]/45 hover:bg-[#fbf8f1]"
              }`}
            >
              <span
                className={`mb-4 h-1.5 w-8 rounded-full transition-all duration-300 ${
                  selected
                    ? "bg-[#c8791a]"
                    : "bg-[#e6dccd] group-hover:w-12 group-hover:bg-[#d7bf9d]"
                }`}
                aria-hidden
              />
              <span
                className="text-sm font-bold tracking-[-0.01em] text-[#18181f]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {documentType.label}
              </span>
              <span className="mt-2 text-xs leading-relaxed text-[#70685d]">
                {documentType.hint}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
