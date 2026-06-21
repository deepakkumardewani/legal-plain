import { CheckCircle2 } from "lucide-react";

import { TRUST_ITEMS } from "@/components/landing/landingContent";

export function TrustStrip() {
  return (
    <div className="border-y border-outline-warm bg-surface-warm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-4 md:px-8">
        {TRUST_ITEMS.map((item) => (
          <span
            key={item}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant"
          >
            <CheckCircle2
              size={14}
              strokeWidth={2}
              className="shrink-0 text-accent"
              aria-hidden="true"
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
