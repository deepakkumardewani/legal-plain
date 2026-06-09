import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUnloadGuard } from "@/lib/useUnloadGuard";

describe("useUnloadGuard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds beforeunload listener when active is true", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useUnloadGuard(true));
    expect(addSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("does not add listener when active is false", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useUnloadGuard(false));
    expect(addSpy).not.toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("removes listener when active toggles to false", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { rerender } = renderHook(({ active }) => useUnloadGuard(active), {
      initialProps: { active: true },
    });
    rerender({ active: false });
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });

  it("removes listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useUnloadGuard(true));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function));
  });
});
