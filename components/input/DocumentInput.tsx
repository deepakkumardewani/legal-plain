"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 150_000;
const WARN_CHARS = 120_000;

interface DocumentInputProps {
  value: string;
  onChange: (text: string) => void;
  uploadTab?: React.ReactNode;
}

export function DocumentInput({ value, onChange, uploadTab }: DocumentInputProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<{
    destroy: () => void;
    state: { doc: { length: number; toString: () => string } };
    dispatch: (spec: Record<string, unknown>) => void;
  } | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const showWarning = charCount >= WARN_CHARS && charCount <= MAX_CHARS;

  const handleTabKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!uploadTab) return;
      const tabs: Array<"paste" | "upload"> = ["paste", "upload"];
      const idx = tabs.indexOf(activeTab);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const next = e.key === "ArrowRight" ? (idx + 1) % 2 : (idx - 1 + 2) % 2;
        setActiveTab(tabs[next]);
      }
    },
    [activeTab, uploadTab],
  );

  useEffect(() => {
    if (!editorRef.current || activeTab !== "paste") return;

    let destroyed = false;
    let editorView: { destroy: () => void } | null = null;

    async function initEditor() {
      const [{ EditorState }, { EditorView }, cm] = await Promise.all([
        import("@codemirror/state"),
        import("@codemirror/view"),
        import("codemirror"),
      ]);

      if (!editorRef.current || destroyed) return;

      const updateListener = EditorView.updateListener.of((update: any) => {
        if (update.docChanged) {
          const text = update.state.doc.toString();
          if (text.length > MAX_CHARS) {
            const current = viewRef.current;
            if (current && current.state.doc.length > MAX_CHARS) {
              const truncated = text.slice(0, MAX_CHARS);
              current.dispatch({
                changes: { from: 0, to: current.state.doc.length, insert: truncated },
              });
            }
            return;
          }
          onChangeRef.current(text);
        }
      });

      const extensions = [
        cm.basicSetup,
        EditorView.lineWrapping,
        updateListener,
        EditorState.transactionFilter.of((tr: any) => {
          if (tr.docChanged && tr.newDoc.length > MAX_CHARS) {
            return [];
          }
          return tr;
        }),
        EditorView.theme({
          "&": { maxHeight: "400px" },
          ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, monospace" },
          ".cm-content": { padding: "12px" },
          ".cm-line": { lineHeight: "1.6" },
        }),
      ];

      const state = EditorState.create({
        doc: value,
        extensions,
      });

      editorView = new EditorView({
        state,
        parent: editorRef.current,
      });
      // The editorView type from dynamic import is incomplete; the real object satisfies the ref type
      viewRef.current = editorView as unknown as typeof viewRef.current;
    }

    initEditor();

    return () => {
      destroyed = true;
      editorView?.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Sync external value changes into the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view || activeTab !== "paste") return;

    const currentText = view.state.doc.toString();
    if (value !== currentText) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value, activeTab]);

  return (
    <div className="w-full">
      <div
        className="flex border-b"
        role="tablist"
        aria-label="Document input method"
        onKeyDown={handleTabKey}
      >
        <button
          role="tab"
          aria-selected={activeTab === "paste"}
          aria-controls="paste-panel"
          id="paste-tab"
          tabIndex={activeTab === "paste" ? 0 : -1}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "paste"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500 hover:text-gray-700",
          )}
          onClick={() => setActiveTab("paste")}
        >
          Paste Text
        </button>
        {uploadTab && (
          <button
            role="tab"
            aria-selected={activeTab === "upload"}
            aria-controls="upload-panel"
            id="upload-tab"
            tabIndex={activeTab === "upload" ? 0 : -1}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "upload"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            )}
            onClick={() => setActiveTab("upload")}
          >
            Upload PDF
          </button>
        )}
      </div>

      <div
        id="paste-panel"
        role="tabpanel"
        aria-labelledby="paste-tab"
        hidden={activeTab !== "paste"}
      >
        {activeTab === "paste" && (
          <div className="relative">
            <div
              ref={editorRef}
              className="min-h-[200px] rounded-b-md border border-t-0 border-gray-200 bg-white"
            />
            {charCount === 0 && (
              <p className="pointer-events-none absolute left-3 top-3 text-sm text-gray-400">
                Paste your contract here…
              </p>
            )}
          </div>
        )}
      </div>

      {uploadTab && (
        <div
          id="upload-panel"
          role="tabpanel"
          aria-labelledby="upload-tab"
          hidden={activeTab !== "upload"}
        >
          {activeTab === "upload" && uploadTab}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-sm">
        <span
          className={cn(
            "tabular-nums",
            isOverLimit && "font-medium text-red-600",
            showWarning && "font-medium text-amber-600",
            !isOverLimit && !showWarning && "text-gray-500",
          )}
        >
          {charCount.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")} characters
        </span>
        {showWarning && !isOverLimit && (
          <span className="text-amber-600">Approaching character limit</span>
        )}
        {isOverLimit && (
          <span className="text-red-600">Character limit exceeded. Text truncated to 150k.</span>
        )}
      </div>
    </div>
  );
}
