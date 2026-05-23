"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#e4dfd6]">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 py-6 text-left group"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span
              className="text-base font-semibold text-[#18181f] group-hover:text-[#c8791a] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {item.q}
            </span>
            <span
              className={`shrink-0 text-[#c8791a] transition-transform duration-200 ${open === i ? "rotate-45" : ""}`}
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 3.75V14.25M3.75 9H14.25"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateRows: open === i ? "1fr" : "0fr",
              transition: "grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="overflow-hidden">
              <p className="pb-6 text-[0.9375rem] text-[#72728a] leading-relaxed max-w-[65ch]">
                {item.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
