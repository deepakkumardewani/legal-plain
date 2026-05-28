interface StepHeadingProps {
  num: string;
  title: string;
  hint: string;
}

export function StepHeading({ num, title, hint }: StepHeadingProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className="text-sm font-bold tabular-nums text-[#c8791a]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {num}
      </span>
      <div>
        <h2
          className="text-lg font-bold tracking-[-0.015em] text-[#18181f]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm leading-relaxed text-[#70685d]">{hint}</p>
      </div>
    </div>
  );
}
