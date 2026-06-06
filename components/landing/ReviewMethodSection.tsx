import { METHOD_STEPS } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

export function ReviewMethodSection() {
  return (
    <section
      id="method"
      className="scroll-mt-24 border-y border-[#e6dccd] bg-[#fffdf8] px-5 py-24 md:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          eyebrow="Review method"
          title="From document to decision."
          body="LegalPlain turns a dense agreement into a structured review: what kind of contract it is, which clauses matter, where the risk sits, and what you may want to ask before signing."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {METHOD_STEPS.map((step) => (
            <article
              key={step.num}
              className="group rounded-[1.5rem] border border-transparent p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#e6dccd] hover:bg-[#fbf8f1]"
            >
              <span
                className="text-6xl font-black leading-none tracking-[-0.08em] text-[#9a8570] transition-colors duration-300 group-hover:text-[#8f7960]"
                style={{ fontFamily: "var(--font-display)" }}
                aria-hidden="true"
              >
                {step.num}
              </span>
              <h3
                className="mt-5 text-xl font-bold tracking-[-0.02em] text-[#171612]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#70685d]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
