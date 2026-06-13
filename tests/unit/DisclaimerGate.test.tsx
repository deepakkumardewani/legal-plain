import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DisclaimerGate } from "@/components/input/DisclaimerGate";

const sessionStore = new Map<string, string>();

function mockSessionStorage(): void {
  Object.defineProperty(window, "sessionStorage", {
    value: {
      getItem: vi.fn((key: string) => sessionStore.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        sessionStore.set(key, value);
      }),
      removeItem: vi.fn((_) => {
        /* no-op */
      }),
      clear: vi.fn(() => {
        sessionStore.clear();
      }),
    },
    writable: true,
  });
}

beforeEach(() => {
  sessionStore.clear();
  mockSessionStorage();
});

afterEach(() => {
  cleanup();
});

function renderGate() {
  return render(
    <DisclaimerGate>
      <p data-testid="input-area">Input area</p>
    </DisclaimerGate>,
  );
}

describe("DisclaimerGate", () => {
  it("shows the disclaimer modal on a fresh session", () => {
    renderGate();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/LexLight provides general educational information/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("input-area").closest('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("hides the modal after clicking 'I understand'", () => {
    renderGate();

    fireEvent.click(screen.getByText("I understand — continue"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByTestId("input-area").closest('[aria-hidden="true"]'),
    ).not.toBeInTheDocument();
  });

  it("persists acknowledgement within the same session", () => {
    sessionStore.set("legalplain_disclaimer", "ack");

    renderGate();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("re-shows the modal in a new session (empty sessionStorage)", () => {
    renderGate();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("traps focus inside the modal", () => {
    renderGate();

    const button = screen.getByText("I understand — continue");
    expect(document.activeElement).toBe(button);
  });

  it("does not close on Escape key", () => {
    renderGate();

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    renderGate();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "disclaimer-title");
    expect(dialog).toHaveAttribute("aria-describedby", "disclaimer-body");
  });

  it("marks children wrapper with aria-hidden when modal is open", () => {
    renderGate();

    const inputEl = screen.getByTestId("input-area");
    expect(inputEl.closest('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
