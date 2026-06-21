"use client";

import { useEffect, useRef, useState } from "react";

interface InfoPopoverItem {
  label: string;
  hint: string;
}

interface InfoPopoverProps {
  items: readonly InfoPopoverItem[];
  label?: string;
}

export function InfoPopover({ items, label = "Learn more" }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-[#c8791a]/40 text-[#c8791a] transition-colors hover:bg-[#fff8f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/50"
      >
        <span className="text-[11px] font-bold leading-none" aria-hidden>
          i
        </span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={label}
          className="absolute left-6 top-0 z-50 w-72 rounded-2xl border border-[#e6dccd] bg-[#fffdf8] p-4 shadow-[0_16px_48px_-24px_rgba(74,55,31,0.25)]"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#c8791a]">
            Your role in the NDA
          </p>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.label}>
                <span className="block text-sm font-semibold text-[#18181f]">{item.label}</span>
                <span className="text-xs leading-relaxed text-[#70685d]">{item.hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
