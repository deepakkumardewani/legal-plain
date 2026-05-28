import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FollowUpInput } from "@/components/analysis/FollowUpInput";
import { ClauseNavigationProvider } from "@/components/analysis/ClauseNavigationContext";
import type { AnalysisResult } from "@/lib/types";

vi.mock("@/lib/userId", () => ({
  getOrCreateUserId: vi.fn().mockResolvedValue("test-user-id-1234-5678-90ab-cdef12345678"),
}));

const mockAnalysis: AnalysisResult = {
  documentType: "EMPLOYMENT_CONTRACT",
  governingLawJurisdiction: "New York, USA",
  partyLocations: ["California, USA"],
  userJurisdiction: null,
  effectiveJurisdiction: "New York, USA",
  jurisdictionMismatch: null,
  overallRiskScore: 75,
  overallRiskLabel: "Moderate Risk",
  redFlagCount: 1,
  unusualCount: 0,
  contextDependentCount: 0,
  standardCount: 1,
  clauses: [
    {
      id: "clause-1",
      title: "Non-Compete",
      originalExcerpt: "You shall not compete.",
      plainEnglish: "No competing.",
      riskLevel: "RED",
      riskReason: "Too broad.",
      comparisonToStandard: "Standard is narrower.",
      obligation: "Do not compete.",
    },
  ],
  missingClauses: [],
  keyDates: [],
  yourRights: [],
  yourObligations: [],
  analyzedAt: "2026-05-18T12:00:00Z",
  analysisId: "660e8400-e29b-41d4-a716-446655440001",
  followUpQuestionsRemaining: 3,
};

function renderInput(overrides: Partial<AnalysisResult> = {}) {
  const analysis = { ...mockAnalysis, ...overrides };
  return render(
    <ClauseNavigationProvider clauses={analysis.clauses}>
      <FollowUpInput
        analysis={analysis}
        documentText="Sample contract text for follow-up questions."
      />
    </ClauseNavigationProvider>,
  );
}

describe("FollowUpInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock successful fetch by default
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: "This clause [clause-1] is too broad. You should negotiate it.",
        citedClauseIds: ["clause-1"],
        remaining: 2,
      }),
    });
  });

  it("renders with remaining question count", () => {
    renderInput();
    expect(screen.getByText("Ask a Follow-Up Question")).toBeTruthy();
    expect(screen.getByText("3 questions remaining")).toBeTruthy();
  });

  it("shows singular for 1 remaining", () => {
    renderInput({ followUpQuestionsRemaining: 1 });
    expect(screen.getByText("1 question remaining")).toBeTruthy();
  });

  it("disables input when remaining is 0", () => {
    renderInput({ followUpQuestionsRemaining: 0 });
    expect(screen.getByText("No questions remaining for this analysis")).toBeTruthy();
    const textarea = screen.getByLabelText("Follow-up question");
    expect(textarea).toBeDisabled();
    expect(screen.getByText("Ask")).toBeDisabled();
  });

  it("shows character counter", () => {
    renderInput();
    expect(screen.getByText("0/500")).toBeTruthy();
  });

  it("warns near character limit", () => {
    renderInput();
    const textarea = screen.getByLabelText("Follow-up question");
    fireEvent.change(textarea, { target: { value: "a".repeat(460) } });
    const counter = screen.getByText("460/500");
    expect(counter.className).toContain("text-amber-600");
  });

  it("submits and displays answer", async () => {
    renderInput();
    const textarea = screen.getByLabelText("Follow-up question");

    fireEvent.change(textarea, { target: { value: "Is this non-compete enforceable?" } });
    fireEvent.click(screen.getByText("Ask"));

    await waitFor(() => {
      expect(screen.getByText("Is this non-compete enforceable?")).toBeTruthy();
    });

    // Answer text should be rendered
    expect(screen.getByText(/This clause/)).toBeTruthy();

    // Remaining should update from server response
    await waitFor(() => {
      expect(screen.getByText("2 questions remaining")).toBeTruthy();
    });
  });

  it("shows error on 429 response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: "Rate limit exceeded", remaining: 0 }),
    });

    renderInput();
    fireEvent.change(screen.getByLabelText("Follow-up question"), {
      target: { value: "Test question?" },
    });
    fireEvent.click(screen.getByText("Ask"));

    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/i)).toBeTruthy();
    });
  });

  it("shows network error on fetch failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    renderInput();
    fireEvent.change(screen.getByLabelText("Follow-up question"), {
      target: { value: "Test question?" },
    });
    fireEvent.click(screen.getByText("Ask"));

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeTruthy();
    });
  });

  it("renders clause ID citations as clickable links", async () => {
    renderInput();
    fireEvent.change(screen.getByLabelText("Follow-up question"), {
      target: { value: "Explain clause-1" },
    });
    fireEvent.click(screen.getByText("Ask"));

    await waitFor(() => {
      const citation = screen.getByText("[clause-1]");
      expect(citation.tagName).toBe("BUTTON");
    });
  });
});
