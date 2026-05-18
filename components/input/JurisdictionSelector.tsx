"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_JURISDICTIONS, type JurisdictionOption } from "@/lib/jurisdictions";
import { cn } from "@/lib/utils";

interface JurisdictionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function JurisdictionSelector({ value, onChange }: JurisdictionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = ALL_JURISDICTIONS.find((j) => j.value === value) ?? ALL_JURISDICTIONS[0];

  const filtered = search
    ? ALL_JURISDICTIONS.filter(
        (j) => j.value === "" || j.label.toLowerCase().includes(search.toLowerCase()),
      )
    : ALL_JURISDICTIONS;

  const selectOption = useCallback(
    (option: JurisdictionOption) => {
      onChange(option.value);
      setSearch("");
      setOpen(false);
      setHighlightIndex(-1);
      inputRef.current?.blur();
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          e.preventDefault();
          setOpen(true);
          return;
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIndex >= 0 && highlightIndex < filtered.length) {
            selectOption(filtered[highlightIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setHighlightIndex(-1);
          break;
      }
    },
    [open, filtered, highlightIndex, selectOption],
  );

  useEffect(() => {
    if (open && highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlightIndex]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      <label htmlFor="jurisdiction-input" className="mb-1 block text-sm font-medium text-gray-700">
        Where will this contract be enforced?{" "}
        <span className="font-normal text-gray-400">(optional but improves accuracy)</span>
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="jurisdiction-input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="jurisdiction-list"
          aria-haspopup="listbox"
          aria-activedescendant={
            highlightIndex >= 0 ? `jurisdiction-option-${highlightIndex}` : undefined
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="Not specified"
          value={open ? search : selected.label}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {open && (
          <ul
            ref={listRef}
            id="jurisdiction-list"
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No results found</li>
            ) : (
              filtered.map((jurisdiction, index) => (
                <li
                  key={jurisdiction.value || "__not-specified__"}
                  id={`jurisdiction-option-${index}`}
                  role="option"
                  aria-selected={jurisdiction.value === value}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm",
                    index === highlightIndex && "bg-gray-100",
                    jurisdiction.value === value && "font-medium text-gray-900",
                  )}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectOption(jurisdiction)}
                >
                  {jurisdiction.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
