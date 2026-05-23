import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// next/font loaders run at build time and are unavailable in jsdom; return a
// stub matching the loader's shape so components importing fonts can render.
vi.mock("next/font/google", () => {
  const loader = () => ({
    className: "mock-font",
    variable: "mock-font-variable",
    style: { fontFamily: "mock-font" },
  });
  return new Proxy({}, { get: () => loader });
});

afterEach(() => {
  cleanup();
});
