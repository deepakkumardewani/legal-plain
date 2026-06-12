"use client";

import { useEffect } from "react";
import Link from "next/link";
import { fontVariables } from "@/lib/fonts";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div
      className={`${fontVariables} flex min-h-screen flex-col items-center justify-center bg-[#fbf8f1] px-4 text-center`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <p
        className="text-5xl font-bold text-[#e6dccd]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        500
      </p>
      <h1
        className="mt-4 text-2xl font-semibold text-[#0e0f16]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#5c5c66]">
        An unexpected error occurred. You can try again, or head back to the home page.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#0e0f16] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0e0f16]/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[#0e0f16]/15 px-5 py-2.5 text-sm font-medium text-[#0e0f16] hover:bg-[#0e0f16]/5"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
