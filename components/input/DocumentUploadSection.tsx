import { PdfUpload } from "@/components/input/PdfUpload";
import { StepHeading } from "@/components/input/StepHeading";

interface DocumentUploadSectionProps {
  onText: (text: string) => void;
}

export function DocumentUploadSection({ onText }: DocumentUploadSectionProps) {
  return (
    <section className="ap-rise ap-d2 rounded-[2rem] border border-[#e6dccd] bg-[#fffdf8] p-5 shadow-[0_30px_90px_-70px_rgba(74,55,31,0.75)] md:p-6">
      <StepHeading
        num="01"
        title="Add your document"
        hint="Upload the agreement you want reviewed."
      />
      <div className="mt-5">
        <PdfUpload onText={onText} />
      </div>
    </section>
  );
}
