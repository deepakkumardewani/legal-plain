import Link from "next/link";
import { fontVariables } from "@/lib/fonts";

export default function SharedNotFound() {
  return (
    <div
      className={`${fontVariables} flex min-h-screen flex-col items-center justify-center bg-[#fbf8f1] px-4 text-center`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <p
        className="text-5xl font-bold text-[#e6dccd]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </p>
      <h1
        className="mt-4 text-2xl font-semibold text-[#0e0f16]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Link expired or not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#5c5c66]">
        This shared analysis link has expired (links are valid for 24 hours) or was never created.
      </p>
      <Link
        href="/analyze"
        className="mt-6 rounded-lg bg-[#0e0f16] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0e0f16]/90"
      >
        Analyze a document
      </Link>
    </div>
  );
}
