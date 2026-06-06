import { REPORT_ITEMS } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

export function ReportOutcomesSection() {
  return (
    <section className="px-5 py-24 md:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro
            eyebrow="What the report gives you"
            title="A practical map of the agreement."
            body="The output is structured for decision-making: where the risk is, why it matters, what is missing, and what language may be worth asking for."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REPORT_ITEMS.map((item, index) => (
              <article
                key={item.title}
                className="group rounded-[1.35rem] border border-transparent p-5 transition-all duration-300 hover:border-[#e6dccd] hover:bg-[#fffdf8]"
              >
                <p
                  className="mb-3 text-sm font-bold tabular-nums text-[#9c5a0f] transition-transform duration-300 group-hover:translate-x-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3
                  className="text-lg font-bold tracking-[-0.015em] text-[#171612]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#70685d]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
