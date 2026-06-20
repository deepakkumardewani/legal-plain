import { DOCUMENT_SCOPES } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

export function SupportedDocumentsSection() {
  return (
    <section className="px-5 py-24 md:px-8 lg:py-32">
      <div id="documents" className="mx-auto max-w-6xl scroll-mt-24">
        <SectionIntro
          eyebrow="Supported documents"
          title="Narrow scope. Better answers."
          body="LexLight focuses on contracts people often sign without a lawyer, then tailors the review to the risks that actually appear in that category. More document types are coming soon."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {DOCUMENT_SCOPES.map((doc) => (
            <article
              key={doc.name}
              className="group rounded-[1.75rem] border border-[#e6dccd] bg-[#fffdf8] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#d7bf9d] hover:shadow-[0_28px_70px_-48px_rgba(74,55,31,0.7)]"
            >
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#9c5a0f] transition-transform duration-300 group-hover:translate-x-1">
                Reviewed for signers
              </p>
              <h3
                className="text-[1.55rem] font-bold tracking-[-0.025em] text-[#171612]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {doc.name}
              </h3>
              <p className="mt-3 min-h-[72px] text-[0.98rem] leading-relaxed text-[#70685d]">
                {doc.description}
              </p>
              <ul className="mt-7 space-y-3 border-t border-[#ebe2d6] pt-6">
                {doc.focus.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#3f3b34]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8791a] transition-transform duration-300 group-hover:scale-125" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
