"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Detecting document type…", duration: 3000 },
  { label: "Extracting jurisdiction…", duration: 2000 },
  { label: "Analyzing all clauses together…", duration: 17000 },
  { label: "Checking for missing clauses…", duration: 3000 },
  { label: "Compiling your report…", duration: 1000 },
];

interface LoadingProgressProps {
  active: boolean;
}

export function LoadingProgress({ active }: LoadingProgressProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let current = 0;

    function advance() {
      if (current < STAGES.length - 1) {
        current++;
        setStage(current);
        timeout = setTimeout(advance, STAGES[current].duration);
      }
    }

    timeout = setTimeout(advance, STAGES[0].duration);

    return () => clearTimeout(timeout);
  }, [active]);

  if (!active) return null;

  return (
    <div className="mt-8 w-full rounded-2xl border border-[#e4dfd6] bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-[#e4dfd6] border-t-[#c8791a]"
          aria-hidden
        />
        <p className="text-[15px] font-semibold text-[#18181f]">{STAGES[stage].label}</p>
      </div>
      <div className="flex gap-1.5">
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < stage && "bg-[#c8791a]",
              i === stage && "animate-pulse bg-[#c8791a]",
              i > stage && "bg-[#e4dfd6]",
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#a3a0a8]">
        Step {stage + 1} of {STAGES.length}
      </p>
    </div>
  );
}
