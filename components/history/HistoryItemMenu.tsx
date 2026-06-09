"use client";

import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AnalysisHistoryEntry } from "@/lib/analysisHistory";

interface HistoryItemMenuProps {
  entry: AnalysisHistoryEntry;
  label: string;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function HistoryItemMenu({ entry, label, onRename, onDelete }: HistoryItemMenuProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(entry.customName ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function openRename() {
    setRenameValue(entry.customName ?? "");
    setRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function commitRename() {
    setRenaming(false);
    await onRename(entry.analysisId, renameValue.trim());
  }

  function handleRenameKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  }

  if (renaming) {
    return (
      <div
        className="relative z-10 flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="none"
      >
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleRenameKey}
          onBlur={commitRename}
          placeholder={label}
          className="h-7 w-40 rounded-md border border-[#c8791a]/50 bg-[#fffdf8] px-2 text-xs text-[#18181f] outline-none focus:ring-1 focus:ring-[#c8791a]/40"
          aria-label="Rename analysis"
        />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          aria-label="More options"
          className="relative z-10 flex h-7 w-7 items-center justify-center rounded-md text-[#9a9080] transition-colors duration-150 hover:bg-[#f0ebe4] hover:text-[#18181f]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            openRename();
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.analysisId);
          }}
          className="text-[#c0392b] focus:text-[#c0392b]"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
