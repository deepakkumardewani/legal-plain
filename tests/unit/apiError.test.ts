import { describe, it, expect, vi } from "vitest";
import { serverError } from "@/lib/apiError";

describe("serverError", () => {
  it("returns NextResponse with status 500 and default message", () => {
    const response = serverError("Test label", new Error("Something broke"));
    expect(response.status).toBe(500);

    const body = response.json() as Promise<{ error: string }>;
    return expect(body).resolves.toEqual({ error: "Internal server error. Please try again." });
  });

  it("accepts a custom response message", () => {
    const response = serverError("Custom", new Error("fail"), "Custom error text");
    expect(response.status).toBe(500);

    const body = response.json() as Promise<{ error: string }>;
    return expect(body).resolves.toEqual({ error: "Custom error text" });
  });

  it("handles non-Error thrown values", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = serverError("Label", "raw string error");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  it("handles Error with cause", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const cause = new Error("root cause");
    const response = serverError("Label", new Error("wrapper", { cause }));
    expect(response.status).toBe(500);
    spy.mockRestore();
  });
});
