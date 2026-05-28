interface SectionIntroProps {
  eyebrow: string;
  title: string;
  body: string;
  light?: boolean;
}

export function SectionIntro({ eyebrow, title, body, light = false }: SectionIntroProps) {
  return (
    <div>
      <p
        className={`mb-4 text-xs font-semibold uppercase tracking-[0.22em] ${
          light ? "text-[#e0a14a]" : "text-[#c8791a]"
        }`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {eyebrow}
      </p>
      <h2
        className={`max-w-[12ch] tracking-[-0.045em] ${
          light ? "text-[#f7efe2]" : "text-[#171612]"
        }`}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(2.35rem, 4vw + 0.5rem, 4.75rem)",
          lineHeight: 0.96,
        }}
      >
        {title}
      </h2>
      <p
        className={`mt-6 max-w-[65ch] text-[1.03rem] leading-[1.75] ${
          light ? "text-[#9f9788]" : "text-[#70685d]"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
