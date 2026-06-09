import { StepHeading } from "@/components/input/StepHeading";

interface OptionCard<T extends string> {
  value: T;
  label: string;
  hint: string;
}

interface OptionCardSectionProps<T extends string> {
  num: string;
  title: string;
  hint: string;
  options: readonly OptionCard<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

export function OptionCardSection<T extends string>({
  num,
  title,
  hint,
  options,
  value,
  onChange,
}: OptionCardSectionProps<T>) {
  return (
    <section className="ap-rise ap-d3">
      <StepHeading num={num} title={title} hint={hint} />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`group flex min-h-[110px] flex-col items-start rounded-[1.25rem] border px-4 py-4 text-left transition-all duration-300 ${
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
                {option.label}
              </span>
              <span className="mt-2 text-xs leading-relaxed text-[#70685d]">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
