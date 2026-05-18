"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "legalplain_disclaimer";
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          aria-describedby="disclaimer-body"
          ref={dialogRef}
        >
          <div className="max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 id="disclaimer-title" className="text-lg font-semibold text-gray-900">
              Legal Disclaimer
            </h2>
            <p id="disclaimer-body" className="mt-3 text-sm leading-relaxed text-gray-600">
              LegalPlain provides general educational information only — not legal advice. No
              attorney-client relationship is formed by using this tool. The analysis may contain
              errors and does not account for all applicable laws. Do not rely on this analysis
              alone to make legal decisions. For matters of significant consequence, consult a
              licensed attorney in your jurisdiction.
            </p>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleAcknowledge}>I understand — continue</Button>
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
