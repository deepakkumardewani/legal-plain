import { SectionIntro } from "@/components/landing/SectionIntro";

const PRIVACY_ITEMS = [
  {
    title: "No account gate",
    body: "Use the analyzer without creating a profile or handing over an email address first.",
  },
  {
    title: "Document not stored",
    body: "LegalPlain sends extracted text for analysis and does not keep the document in its own database.",
  },
  {
    title: "Temporary sharing",
    body: "Share links store analysis results only when you choose to create one, and they expire automatically.",
  },
] as const;

export function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-24 bg-[#0f100e] px-5 py-24 md:px-8 lg:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <SectionIntro
          eyebrow="Privacy posture"
          title="Your contract is not the product."
          body="The privacy promise is simple: use the tool without an account, and do not treat the document itself as something to keep."
          light
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PRIVACY_ITEMS.map((item) => (
            <article
              key={item.title}
              className="group rounded-[1.4rem] border border-[#2c2b25] bg-[#171713] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4a3d2d] hover:bg-[#1d1c17]"
            >
              <h3
                className="font-semibold text-[#f7efe2]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9f9788]">{item.body}</p>
              <span className="mt-6 block h-px w-10 bg-[#c8791a]/45 transition-all duration-300 group-hover:w-16 group-hover:bg-[#e0a14a]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
