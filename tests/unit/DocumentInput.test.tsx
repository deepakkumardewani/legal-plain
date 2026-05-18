import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@codemirror/view", () => ({
  EditorView: {
    updateListener: { of: () => [] },
    lineWrapping: [],
    theme: () => [],
  },
  keymap: { of: () => [] },
}));

vi.mock("codemirror", () => ({
  EditorState: {
    create: () => ({
      doc: { toString: () => "" },
    }),
    transactionFilter: { of: () => [] },
  },
  EditorView: function () {
    return {
      destroy: () => {},
      state: { doc: { toString: () => "" } },
      dispatch: () => {},
      contentDOM: document.createElement("div"),
    };
  },
  basicSetup: [],
  keymap: { of: () => [] },
}));

import { DocumentInput } from "@/components/input/DocumentInput";

afterEach(() => {
  cleanup();
});

describe("DocumentInput", () => {
  it("renders the paste tab by default", () => {
    render(<DocumentInput value="" onChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Paste Text" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Paste your contract here…")).toBeInTheDocument();
  });

  it("shows character count at 0", () => {
    render(<DocumentInput value="" onChange={() => {}} />);

    expect(screen.getByText(/0 \/ 150,000 characters/)).toBeInTheDocument();
  });

  it("shows updated character count from value prop", () => {
    render(<DocumentInput value="Hello world" onChange={() => {}} />);

    expect(screen.getByText(/11 \/ 150,000 characters/)).toBeInTheDocument();
  });

  it("shows warning at 120k characters", () => {
    const text = "x".repeat(120_000);
    render(<DocumentInput value={text} onChange={() => {}} />);

    expect(screen.getByText(/Approaching character limit/)).toBeInTheDocument();
  });

  it("shows error when over 150k characters", () => {
    const text = "x".repeat(150_001);
    render(<DocumentInput value={text} onChange={() => {}} />);

    expect(screen.getByText(/Character limit exceeded/)).toBeInTheDocument();
  });

  it("has correct tablist aria attributes", () => {
    render(<DocumentInput value="" onChange={() => {}} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "paste-panel");
  });

  it("switches to upload tab when uploadTab is provided and clicked", () => {
    render(<DocumentInput value="" onChange={() => {}} uploadTab={<p>Upload widget</p>} />);

    fireEvent.click(screen.getByRole("tab", { name: "Upload PDF" }));

    expect(screen.getByRole("tab", { name: "Upload PDF" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Upload widget")).toBeInTheDocument();
  });

  it("supports arrow key navigation between tabs", () => {
    render(<DocumentInput value="" onChange={() => {}} uploadTab={<p>Upload widget</p>} />);

    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Upload PDF" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Paste Text" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("does not show upload tab when uploadTab prop is not provided", () => {
    render(<DocumentInput value="" onChange={() => {}} />);

    expect(screen.queryByRole("tab", { name: "Upload PDF" })).not.toBeInTheDocument();
  });

  it("hides paste panel when upload tab is active", () => {
    render(<DocumentInput value="" onChange={() => {}} uploadTab={<p>Upload widget</p>} />);

    fireEvent.click(screen.getByRole("tab", { name: "Upload PDF" }));

    // Paste tabpanel should be hidden (query with { hidden: true } since it's excluded from a11y tree)
    const pastePanel = document.getElementById("paste-panel");
    expect(pastePanel).toHaveAttribute("hidden");

    // Upload widget should be visible
    expect(screen.getByText("Upload widget")).toBeVisible();
  });
});
