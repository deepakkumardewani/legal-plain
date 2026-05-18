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
    <div className="mt-6 w-full">
      <div className="mb-4 flex items-center gap-3">
        <svg
          className="h-5 w-5 animate-spin text-gray-900"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-900">{STAGES[stage].label}</p>
      </div>
      <div className="flex gap-1">
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < stage && "bg-gray-900",
              i === stage && "animate-pulse bg-gray-900",
              i > stage && "bg-gray-200",
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Stage {stage + 1} of {STAGES.length}
      </p>
    </div>
  );
}
