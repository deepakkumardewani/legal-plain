// Escapes characters that have special meaning in Markdown to prevent injection.
// Applied to user-supplied fields before embedding them in markdown output.
export function escapeMarkdown(text: string): string {
  return text.replace(/[\\`*_{}[\]()+#!|]/g, "\\$&");
}

// Strips non-printable control characters (except newline/tab) before passing
// text to jsPDF, which can produce malformed output on control bytes.
export function sanitizePdfText(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
