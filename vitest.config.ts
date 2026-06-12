import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
      "next/server": path.resolve(__dirname, "tests/mocks/next-server.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx", "components/**/__tests__/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/api/**"],
      exclude: [
        "lib/prompts/**",
        "lib/types.ts",
        "lib/constants.ts",
        "lib/fonts.ts",
        "tests/**",
        "**/*.test.*",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
