import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissingClausesPanel } from "@/components/analysis/MissingClausesPanel";
import { KeyDatesPanel } from "@/components/analysis/KeyDatesPanel";
import { YourRightsPanel } from "@/components/analysis/YourRightsPanel";
import { ObligationsPanel } from "@/components/analysis/ObligationsPanel";
import type { MissingClause, KeyDate } from "@/lib/types";

describe("MissingClausesPanel", () => {
  it("renders nothing when list is empty", () => {
    const { container } = render(<MissingClausesPanel clauses={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders clauses with title, whyItMatters, and whatToAskFor", () => {
    const clauses: MissingClause[] = [
      {
        title: "Expense Reimbursement",
        whyItMatters: "No provision for work expenses.",
        whatToAskFor: "Add reimbursement clause.",
      },
    ];

    render(<MissingClausesPanel clauses={clauses} />);

    expect(screen.getByText("Missing Clauses")).toBeTruthy();
    expect(screen.getByText("Expense Reimbursement")).toBeTruthy();
    expect(screen.getByText("No provision for work expenses.")).toBeTruthy();
    expect(screen.getByText(/Add reimbursement clause/)).toBeTruthy();
  });

  it("renders multiple missing clauses", () => {
    const clauses: MissingClause[] = [
      { title: "Clause A", whyItMatters: "Reason A", whatToAskFor: "Ask A" },
      { title: "Clause B", whyItMatters: "Reason B", whatToAskFor: "Ask B" },
    ];

    render(<MissingClausesPanel clauses={clauses} />);

    expect(screen.getByText("Clause A")).toBeTruthy();
    expect(screen.getByText("Clause B")).toBeTruthy();
  });

  it("uses semantic list element", () => {
    const clauses: MissingClause[] = [
      { title: "Test", whyItMatters: "Reason", whatToAskFor: "Ask" },
    ];

    render(<MissingClausesPanel clauses={clauses} />);

    const list = screen.getByRole("list");
    expect(list).toBeTruthy();
    expect(list.tagName).toBe("UL");
  });
});

describe("KeyDatesPanel", () => {
  it("renders nothing when list is empty", () => {
    const { container } = render(<KeyDatesPanel dates={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders dates with urgency badges", () => {
    const dates: KeyDate[] = [
      { label: "Non-compete", value: "24 months", urgency: "HIGH" },
      { label: "Notice period", value: "2 weeks", urgency: "LOW" },
    ];

    render(<KeyDatesPanel dates={dates} />);

    expect(screen.getByText("Key Dates & Deadlines")).toBeTruthy();
    expect(screen.getByText("Non-compete")).toBeTruthy();
    expect(screen.getByText("24 months")).toBeTruthy();
    expect(screen.getByText("Urgent")).toBeTruthy();
    expect(screen.getByText("Info")).toBeTruthy();
  });

  it("sorts by urgency: HIGH before MEDIUM before LOW", () => {
    const dates: KeyDate[] = [
      { label: "Low priority", value: "value3", urgency: "LOW" },
      { label: "High priority", value: "value1", urgency: "HIGH" },
      { label: "Med priority", value: "value2", urgency: "MEDIUM" },
    ];

    render(<KeyDatesPanel dates={dates} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]?.textContent).toContain("High priority");
    expect(items[1]?.textContent).toContain("Med priority");
    expect(items[2]?.textContent).toContain("Low priority");
  });

  it("renders MEDIUM urgency bonus", () => {
    const dates: KeyDate[] = [{ label: "Test", value: "test", urgency: "MEDIUM" }];

    render(<KeyDatesPanel dates={dates} />);

    expect(screen.getByText("Moderate")).toBeTruthy();
  });
});

describe("YourRightsPanel", () => {
  it("renders nothing when list is empty", () => {
    const { container } = render(<YourRightsPanel rights={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders bulleted rights list", () => {
    const rights = ["Terminate at any time", "Receive salary"];

    render(<YourRightsPanel rights={rights} />);

    expect(screen.getByText("Your Rights")).toBeTruthy();
    expect(screen.getByText("Terminate at any time")).toBeTruthy();
    expect(screen.getByText("Receive salary")).toBeTruthy();
  });

  it("uses semantic list", () => {
    render(<YourRightsPanel rights={["Right A"]} />);

    expect(screen.getByRole("list")).toBeTruthy();
  });
});

describe("ObligationsPanel", () => {
  it("renders nothing when list is empty", () => {
    const { container } = render(<ObligationsPanel obligations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders bulleted obligations list", () => {
    const obligations = ["Maintain confidentiality", "Non-compete for 24 months"];

    render(<ObligationsPanel obligations={obligations} />);

    expect(screen.getByText("Your Obligations")).toBeTruthy();
    expect(screen.getByText("Maintain confidentiality")).toBeTruthy();
    expect(screen.getByText("Non-compete for 24 months")).toBeTruthy();
  });

  it("uses semantic list", () => {
    render(<ObligationsPanel obligations={["Obligation A"]} />);

    expect(screen.getByRole("list")).toBeTruthy();
  });
});
