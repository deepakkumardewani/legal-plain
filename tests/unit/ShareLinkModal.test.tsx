import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareLinkModal } from "@/components/export/ShareLinkModal";
import { sampleAnalysis } from "@/tests/fixtures/analysis";

// Mock userId
vi.mock("@/lib/userId", () => ({
  getOrCreateUserId: vi.fn().mockResolvedValue("660e8400-e29b-41d4-a716-446655440001"),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

function setup(open = true) {
  const onOpenChange = vi.fn();
  const utils = render(
    <ShareLinkModal analysis={sampleAnalysis} open={open} onOpenChange={onOpenChange} />,
  );
  return { ...utils, onOpenChange };
}

describe("ShareLinkModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the 24-hour expiry disclosure before any action", () => {
    setup();
    expect(screen.getByText(/expires in 24 hours/i)).toBeInTheDocument();
  });

  it("shows 'Generate share link' button on disclosure step", () => {
    setup();
    expect(screen.getByRole("button", { name: /generate share link/i })).toBeInTheDocument();
  });

  it("does not show copy button on disclosure step", () => {
    setup();
    expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
  });

  it("shows copy button after successful share creation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareId: "test-share-id-123" }),
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copy share link/i })).toBeInTheDocument();
    });
  });

  it("shows the share URL after creation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareId: "abc-123" }),
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));

    await waitFor(() => {
      expect(screen.getByText(/results\/abc-123/i)).toBeInTheDocument();
    });
  });

  it("shows error when API call fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to create share" }),
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to create share");
    });
  });

  it("copies URL to clipboard when copy button clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareId: "copy-test-id" }),
    });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));

    await waitFor(() => screen.getByRole("button", { name: /copy share link/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy share link/i }));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining("copy-test-id"));
    });
  });

  it("shows 'Copied' feedback after copying", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareId: "feedback-test" }),
    });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));
    await waitFor(() => screen.getByRole("button", { name: /copy share link/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy share link/i }));

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it("shows actionable error and keeps URL visible when clipboard is blocked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareId: "blocked-clipboard-id" }),
    });

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Permission denied")) },
      configurable: true,
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));
    await waitFor(() => screen.getByRole("button", { name: /copy share link/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy share link/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/clipboard access blocked/i);
      // URL must still be visible so user can copy it manually
      expect(screen.getByText(/blocked-clipboard-id/i)).toBeInTheDocument();
    });
  });

  it("sends analysisResult and userId in the request body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shareId: "body-check-id" }),
    });

    setup();
    fireEvent.click(screen.getByRole("button", { name: /generate share link/i }));

    await waitFor(() => screen.getByText(/body-check-id/i));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/share",
      expect.objectContaining({
        method: "POST",
        body: expect.stringMatching(/"analysisResult"/),
      }),
    );
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toHaveProperty("analysisResult");
    expect(body).toHaveProperty("userId");
  });

  it("does not render when closed", () => {
    setup(false);
    expect(screen.queryByText(/expires in 24 hours/i)).not.toBeInTheDocument();
  });
});
