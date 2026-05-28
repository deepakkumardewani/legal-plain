import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { FAQ_ITEMS } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

export function LandingFaqSection() {
  return (
    <section className="border-t border-[#e6dccd] bg-[#fffdf8] px-5 py-24 md:px-8 lg:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionIntro
          eyebrow="FAQ"
          title="Questions worth asking first."
          body="LegalPlain should help you understand a document before you decide whether a lawyer, employer, landlord, or counterparty needs to be involved."
        />

        <div className="mt-10 rounded-[1.75rem] border border-[#e6dccd] bg-[#fbf8f1] p-3 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7bf9d] hover:bg-[#fffdf8] hover:shadow-[0_30px_90px_-64px_rgba(74,55,31,0.75)]">
          <FaqAccordion items={[...FAQ_ITEMS]} />
        </div>
      </div>
    </section>
  );
}
