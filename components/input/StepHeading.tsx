import type { ReactNode } from "react";

interface StepHeadingProps {
  num: string;
  title: string;
  hint: string;
  extra?: ReactNode;
}

export function StepHeading({ num, title, hint, extra }: StepHeadingProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className="text-sm font-bold tabular-nums text-[#c8791a]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {num}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2
            className="text-lg font-bold tracking-[-0.015em] text-[#18181f]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          {extra}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-[#70685d]">{hint}</p>
      </div>
    </div>
  );
}
