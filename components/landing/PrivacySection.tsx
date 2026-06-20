import { Database, EyeOff, Lock, ShieldOff, Timer, UserX } from "lucide-react";

import { SECURITY_ITEMS } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

const ICON_MAP = {
  lock: Lock,
  "shield-off": ShieldOff,
  "eye-off": EyeOff,
  database: Database,
  "user-x": UserX,
  timer: Timer,
} as const;

type IconKey = keyof typeof ICON_MAP;

export function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-24 bg-surface-warm px-5 py-24 md:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          eyebrow="Security & privacy"
          title="Your contract stays yours."
          body="Every claim below reflects how LexLight is built — not marketing language. Your document is analyzed, not stored, and never used to train any AI model."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon as IconKey];
            return (
              <article
                key={item.title}
                className="group rounded-[1.4rem] border border-outline-warm bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_20px_60px_-30px_rgba(74,55,31,0.18)]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim text-accent">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3
                  className="font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
