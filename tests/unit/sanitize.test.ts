import { describe, it, expect } from "vitest";
import { escapeMarkdown, sanitizePdfText } from "@/lib/sanitize";

describe("escapeMarkdown", () => {
  it("escapes backslash", () => {
    expect(escapeMarkdown("a\\b")).toBe("a\\\\b");
  });

  it("escapes backtick", () => {
    expect(escapeMarkdown("`code`")).toBe("\\`code\\`");
  });

  it("escapes asterisk", () => {
    expect(escapeMarkdown("*bold*")).toBe("\\*bold\\*");
  });

  it("escapes underscore for italic", () => {
    expect(escapeMarkdown("_em_")).toBe("\\_em\\_");
  });

  it("escapes curly braces", () => {
    expect(escapeMarkdown("{key}")).toBe("\\{key\\}");
  });

  it("escapes brackets and parens", () => {
    expect(escapeMarkdown("[link](url)")).toBe("\\[link\\]\\(url\\)");
  });

  it("escapes hash and plus", () => {
    expect(escapeMarkdown("# Title")).toBe("\\# Title");
    expect(escapeMarkdown("C++")).toBe("C\\+\\+");
  });

  it("passes through plain text unchanged", () => {
    expect(escapeMarkdown("Hello world")).toBe("Hello world");
  });

  it("handles empty string", () => {
    expect(escapeMarkdown("")).toBe("");
  });
});

describe("sanitizePdfText", () => {
  it("removes null byte", () => {
    expect(sanitizePdfText("abc\x00def")).toBe("abcdef");
  });

  it("removes control characters like bell and vertical tab", () => {
    expect(sanitizePdfText("a\x07b\x0Bc")).toBe("abc");
  });

  it("keeps newlines and tabs", () => {
    expect(sanitizePdfText("line1\nline2\tindented")).toBe("line1\nline2\tindented");
  });

  it("removes delete character (0x7F)", () => {
    expect(sanitizePdfText("abc\x7Fdef")).toBe("abcdef");
  });

  it("handles empty string", () => {
    expect(sanitizePdfText("")).toBe("");
  });

  it("returns clean text unchanged", () => {
    expect(sanitizePdfText("Clean text.")).toBe("Clean text.");
  });
});
