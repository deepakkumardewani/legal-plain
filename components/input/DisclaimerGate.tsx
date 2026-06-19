"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fontVariables } from "@/lib/fonts";

const STORAGE_KEY = "lexlight_disclaimer";
const ACK_VALUE = "ack";

function hasAcknowledged(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === ACK_VALUE;
  } catch {
    return false;
  }
}

function setAcknowledged(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, ACK_VALUE);
  } catch {
    // sessionStorage unavailable — gate will re-prompt
  }
}

interface DisclaimerGateProps {
  children: React.ReactNode;
}

export function DisclaimerGate({ children }: DisclaimerGateProps) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!hasAcknowledged()) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      setShow(true);
    }
  }, []);

  const handleAcknowledge = useCallback(() => {
    setAcknowledged();
    setShow(false);
    prevFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!show || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function trapFocus(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        return;
      }
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", trapFocus);
    first?.focus();

    return () => {
      document.removeEventListener("keydown", trapFocus);
    };
  }, [show]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.inert = show;
    }
  }, [show]);

  if (!mounted) return null;

  return (
    <>
      {show && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0e0f16]/60 p-4 backdrop-blur-sm ${fontVariables}`}
          style={{ fontFamily: "var(--font-body)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          aria-describedby="disclaimer-body"
          ref={dialogRef}
        >
          <div className="max-w-lg rounded-2xl border border-[#e4dfd6] bg-[#faf9f6] p-8 shadow-[0_24px_64px_-16px_rgba(14,15,22,0.5)]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#c8791a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#c8791a]">
              Before you start
            </span>
            <h2
              id="disclaimer-title"
              className="text-2xl font-bold text-[#18181f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              This is guidance, not legal advice.
            </h2>
            <p id="disclaimer-body" className="mt-3 text-[15px] leading-relaxed text-[#72728a]">
              LexLight provides general educational information only — not legal advice. No
              attorney-client relationship is formed by using this tool. The analysis may contain
              errors and does not account for all applicable laws. Do not rely on this analysis
              alone to make legal decisions. For matters of significant consequence, consult a
              licensed attorney in your jurisdiction.
            </p>
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={handleAcknowledge}
                style={{ fontFamily: "var(--font-display)" }}
                className="rounded-full bg-[#c8791a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b36815] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6]"
              >
                I understand — continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={contentRef} aria-hidden={show || undefined}>
        {children}
      </div>
    </>
  );
}
