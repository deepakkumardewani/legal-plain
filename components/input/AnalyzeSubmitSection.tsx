import { AnalyzeButton } from "@/components/input/AnalyzeButton";
import { LoadingProgress } from "@/components/input/LoadingProgress";

interface AnalyzeSubmitSectionProps {
  canAnalyze: boolean;
  loading: boolean;
  error: string | null;
  onAnalyze: () => void;
  onStop: () => void;
}

export function AnalyzeSubmitSection({
  canAnalyze,
  loading,
  error,
  onAnalyze,
  onStop,
}: AnalyzeSubmitSectionProps) {
  return (
    <section>
      {error && (
        <p
          className="mb-5 rounded-[1rem] border border-[#f0c7c2] bg-[#fbeceb] px-4 py-3 text-sm font-medium text-[#b3261e]"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="rounded-[1.75rem] border border-[#e6dccd] bg-[#fffdf8] p-5 md:p-6">
        {loading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e6dccd] bg-white px-5 py-3 text-sm font-semibold text-[#18181f] transition hover:bg-[#f5f0e8]"
          >
            <span className="h-4 w-4 rounded-sm bg-[#18181f]" aria-hidden />
            Stop Analysis
          </button>
        ) : (
          <AnalyzeButton disabled={!canAnalyze} loading={false} onClick={onAnalyze} />
        )}
        {!loading && (
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-[#8b8377]">
            <svg
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 0h10.5a2.25 2.25 0 0 1 2.25 2.25v6a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-6a2.25 2.25 0 0 1 2.25-2.25Z"
              />
            </svg>
            Sent to AI for analysis — never stored on our servers.
          </p>
        )}
      </div>

      <LoadingProgress active={loading} />
    </section>
  );
}
