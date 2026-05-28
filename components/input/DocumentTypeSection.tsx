import { DOCUMENT_TYPES } from "@/components/input/analyzeContent";
import { OptionCardSection } from "@/components/input/OptionCardSection";
import type { DocumentType } from "@/lib/types";

interface DocumentTypeSectionProps {
  value: DocumentType | null;
  onChange: (documentType: DocumentType) => void;
}

export function DocumentTypeSection({ value, onChange }: DocumentTypeSectionProps) {
  return (
    <OptionCardSection
      num="02"
      title="Confirm the document type"
      hint="This keeps the analysis focused on the clauses that matter for this agreement."
      options={DOCUMENT_TYPES}
      value={value}
      onChange={onChange}
    />
  );
}
