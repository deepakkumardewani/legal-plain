import {
  FileText,
  Infinity as InfinityIcon,
  Layers,
  MapPin,
  MessageCircle,
  Scale,
  Share2,
  Zap,
} from "lucide-react";

import { ADVANCED_FEATURES } from "@/components/landing/landingContent";
import { SectionIntro } from "@/components/landing/SectionIntro";

const ICON_MAP = {
  zap: Zap,
  "map-pin": MapPin,
  layers: Layers,
  infinity: InfinityIcon,
  "message-circle": MessageCircle,
  "file-text": FileText,
  "share-2": Share2,
  scale: Scale,
} as const;

type IconKey = keyof typeof ICON_MAP;

export function AdvancedFeaturesSection() {
  return (
    <section className="border-y border-outline-warm bg-surface-warm px-5 py-24 md:px-8 lg:py-32">
      <div id="features" className="mx-auto max-w-6xl scroll-mt-24">
        <SectionIntro
          eyebrow="Built for real use"
          title="Everything in one review."
          body="LexLight is designed to give you a complete picture of any supported contract — not a surface-level scan."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANCED_FEATURES.map((feat) => {
            const Icon = ICON_MAP[feat.icon as IconKey];
            return (
              <article
                key={feat.title}
                className="group rounded-[1.4rem] border border-outline-warm bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_16px_48px_-24px_rgba(74,55,31,0.16)]"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-dim text-accent">
                  <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3
                  className="text-[0.95rem] font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{feat.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
