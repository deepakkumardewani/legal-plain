"use client";

import { useCallback, useState } from "react";

const MIN_CHARS = 100;

interface PasteTextInputProps {
  onText: (text: string) => void;
}

export function PasteTextInput({ onText }: PasteTextInputProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setValue(text);
      onText(text.length >= MIN_CHARS ? text : "");
    },
    [onText],
  );

  const handleClear = useCallback(() => {
    setValue("");
    setTouched(false);
    onText("");
  }, [onText]);

  const tooShort = touched && value.length > 0 && value.length < MIN_CHARS;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className={[
          "min-h-[200px] w-full resize-y rounded-[1.75rem] border bg-[#fffdf8] p-5 text-[15px] text-[#18181f] placeholder-[#a3a0a8] outline-none transition-all duration-200",
          "focus:border-[#c8791a] focus:ring-2 focus:ring-[#c8791a]/20",
          tooShort ? "border-red-400" : "border-[#d8d2c6]",
        ].join(" ")}
        placeholder="Paste your contract text here…"
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        aria-label="Paste document text"
      />
      <div className="flex items-center justify-between px-1">
        {tooShort ? (
          <p className="text-xs text-red-500" role="alert" aria-live="polite">
            Please paste at least {MIN_CHARS} characters for a meaningful analysis.
          </p>
        ) : (
          <p className="text-xs text-[#a3a0a8]" aria-live="polite">
            {value.length > 0 ? `${value.length} characters` : `Minimum ${MIN_CHARS} characters`}
          </p>
        )}
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[#72728a] underline underline-offset-2 hover:text-[#c8791a]"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
