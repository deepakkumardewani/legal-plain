"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = [
  {
    label: "Detecting document type",
    subtexts: [
      "Reading document structure…",
      "Identifying clause patterns…",
      "Mapping section layout…",
    ],
    duration: 3000,
    fromPct: 0,
    toPct: 22,
  },
  {
    label: "Extracting jurisdiction",
    subtexts: [
      "Scanning for governing law…",
      "Locating applicable legal region…",
      "Checking legal references…",
    ],
    duration: 2000,
    fromPct: 22,
    toPct: 36,
  },
  {
    label: "Analyzing all clauses",
    subtexts: [
      "Reviewing employment terms…",
      "Evaluating risk and obligations…",
      "Checking termination conditions…",
      "Assessing restrictive covenants…",
      "Comparing against standard protections…",
      "Scrutinizing liability clauses…",
      "Reviewing IP and confidentiality terms…",
    ],
    duration: 17000,
    fromPct: 36,
    toPct: 80,
  },
  {
    label: "Checking for gaps",
    subtexts: [
      "Looking for missing protections…",
      "Verifying standard clause coverage…",
      "Flagging unusual omissions…",
    ],
    duration: 3000,
    fromPct: 80,
    toPct: 93,
  },
  {
    label: "Compiling your report",
    subtexts: [
      "Organizing findings by risk level…",
      "Formatting your summary…",
      "Highlighting key concerns…",
      "Preparing clause breakdown…",
      "Building your risk score…",
      "Almost ready…",
    ],
    duration: 5000,
    fromPct: 93,
    toPct: 98,
  },
] as const;

const MIN_SUBTEXT_INTERVAL_MS = 2800;

function getSubtextInterval(stageIndex: number): number {
  const { duration, subtexts } = STAGES[stageIndex];
  return Math.max(MIN_SUBTEXT_INTERVAL_MS, Math.floor(duration / subtexts.length));
}

interface LoadingProgressProps {
  active: boolean;
}

export function LoadingProgress({ active }: LoadingProgressProps) {
  const [stage, setStage] = useState(0);
  const [subtextIdx, setSubtextIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const stageStartRef = useRef<number | null>(null);
  const stageRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const subtextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      setStage(0);
      setSubtextIdx(0);
      setProgressPct(0);
      stageRef.current = 0;
      stageStartRef.current = null;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (subtextTimerRef.current !== null) clearTimeout(subtextTimerRef.current);
      return;
    }

    stageStartRef.current = performance.now();
    stageRef.current = 0;

    function scheduleSubtextRotation(stageIndex: number, currentIdx: number) {
      if (subtextTimerRef.current !== null) clearTimeout(subtextTimerRef.current);
      const max = STAGES[stageIndex].subtexts.length - 1;
      if (currentIdx >= max) return; // stop at last subtext
      subtextTimerRef.current = setTimeout(() => {
        const next = currentIdx + 1;
        setSubtextIdx(next);
        scheduleSubtextRotation(stageIndex, next);
      }, getSubtextInterval(stageIndex));
    }

    scheduleSubtextRotation(0, 0);

    // Animate progress bar via rAF — no CSS transition needed, rAF is the animation
    function tick(now: number) {
      const current = stageRef.current;
      const { fromPct, toPct, duration } = STAGES[current];
      const elapsed = now - (stageStartRef.current ?? now);
      const stageProgress = Math.min(elapsed / duration, 1);
      // Ease-out within each stage so it decelerates toward the end
      const eased = 1 - Math.pow(1 - stageProgress, 2);
      const pct = fromPct + (toPct - fromPct) * eased;
      setProgressPct(pct);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    // Advance stages
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let accum = 0;
    STAGES.forEach((s, i) => {
      if (i === 0) return;
      accum += STAGES[i - 1].duration;
      const t = setTimeout(() => {
        stageRef.current = i;
        stageStartRef.current = performance.now();
        setStage(i);
        setSubtextIdx(0);
        scheduleSubtextRotation(i, 0);
      }, accum);
      timeouts.push(t);
    });

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (subtextTimerRef.current !== null) clearTimeout(subtextTimerRef.current);
      timeouts.forEach(clearTimeout);
    };
  }, [active]);

  if (!active) return null;

  const currentSubtexts = STAGES[stage].subtexts;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-2xl border border-[#e4dfd6] bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span
          className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#e4dfd6] border-t-[#c8791a]"
          aria-hidden
        />
        <p className="text-sm font-semibold leading-snug text-[#18181f]">
          Analyzing your document — please don&apos;t close, refresh, or leave this page
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-[#f0ebe4]">
        <div className="h-full rounded-full bg-[#c8791a]" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Step list */}
      <ol className="space-y-3">
        {STAGES.map((s, i) => {
          const isCompleted = i < stage;
          const isCurrent = i === stage;
          const isPending = i > stage;

          return (
            <li key={s.label} className="flex items-start gap-3">
              {/* Status icon */}
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                {isCompleted && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c8791a]/15">
                    <svg
                      className="h-3 w-3 text-[#c8791a]"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2 6.5l2.5 2.5 5.5-5.5"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
                {isCurrent && (
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-[#c8791a] ring-4 ring-[#c8791a]/15"
                    aria-hidden
                  />
                )}
                {isPending && <span className="h-2 w-2 rounded-full bg-[#e4dfd6]" aria-hidden />}
              </span>

              {/* Labels */}
              <div
                className={cn(
                  "min-w-0 flex-1 transition-opacity duration-300",
                  isPending && "opacity-35",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium leading-tight",
                    isCompleted && "text-[#c8791a]",
                    isCurrent && "text-[#18181f]",
                    isPending && "text-[#18181f]",
                  )}
                >
                  {s.label}
                </p>
                {isCurrent && (
                  <p
                    key={`${stage}-${subtextIdx}`}
                    className="mt-0.5 animate-in fade-in duration-500 text-xs text-[#a3a0a8]"
                  >
                    {currentSubtexts[subtextIdx]}
                  </p>
                )}
                {isCompleted && <p className="mt-0.5 text-xs text-[#c8791a]/70">Done</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Privacy note */}
      <p className="mt-4 flex items-center gap-1.5 border-t border-[#f0ebe4] pt-4 text-xs text-[#a3a0a8]">
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
        Your document is sent for AI analysis and never stored by LexLight.
      </p>
    </div>
  );
}
