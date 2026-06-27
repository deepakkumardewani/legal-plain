"use client";

import { useCallback, useState } from "react";
import { PasteTextInput } from "@/components/input/PasteTextInput";
import { PdfUpload } from "@/components/input/PdfUpload";
import { StepHeading } from "@/components/input/StepHeading";

type InputTab = "upload" | "paste";

export type InputMethod = "pdf-upload" | "paste";

interface DocumentUploadSectionProps {
  onText: (text: string) => void;
  onInputMethodChange?: (method: InputMethod) => void;
}

export function DocumentUploadSection({ onText, onInputMethodChange }: DocumentUploadSectionProps) {
  const [activeTab, setActiveTab] = useState<InputTab>("upload");

  const switchTab = useCallback(
    (tab: InputTab) => {
      if (tab === activeTab) return;
      onText("");
      setActiveTab(tab);
      onInputMethodChange?.(tab === "upload" ? "pdf-upload" : "paste");
    },
    [activeTab, onText, onInputMethodChange],
  );

  return (
    <section className="rounded-[2rem] border border-[#e6dccd] bg-[#fffdf8] p-5 shadow-[0_30px_90px_-70px_rgba(74,55,31,0.75)] md:p-6">
      <StepHeading
        num="01"
        title="Add your document"
        hint="Upload a PDF or paste the contract text."
      />

      <div className="mt-5">
        {/* Tab toggle */}
        <div className="mb-4 flex gap-1 rounded-2xl bg-[#f5f0e8] p-1">
          <TabButton
            label="Upload PDF"
            active={activeTab === "upload"}
            onClick={() => switchTab("upload")}
          />
          <TabButton
            label="Paste text"
            active={activeTab === "paste"}
            onClick={() => switchTab("paste")}
          />
        </div>

        {activeTab === "upload" ? (
          <PdfUpload onText={onText} />
        ) : (
          <PasteTextInput onText={onText} />
        )}
      </div>

      <p className="mt-3 text-center text-xs text-[#a3a0a8]">
        Free to use, no account required — results are saved only in your browser.
      </p>
    </section>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200",
        active ? "bg-white text-[#18181f] shadow-sm" : "text-[#72728a] hover:text-[#18181f]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
