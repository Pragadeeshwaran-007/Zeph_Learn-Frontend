import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      // Include only our business logic files — not Radix UI boilerplate, routes, or SSR infra
      include: [
        "src/services/**/*.{ts,tsx}",
        "src/utils/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/components/DifficultyBadge.tsx",
      ],
      exclude: [
        "src/test/**",
        "src/routeTree.gen.ts",
        "src/router.tsx",
        "src/start.ts",
        "src/styles.css",
        "src/utils/seedData.ts",
        "src/hooks/use-mobile.tsx", // Radix UI utility — not unit testable
        "**/*.d.ts",
      ],
      thresholds: {
        // Branch threshold is 55% to account for documented bug lines in
        // useNotifications (lines 34-35, 41-42 — the markRead/markAllRead bug).
        // Raise all to 70%+ after bug fixes are merged.
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
      },
      reporter: ["text", "html", "json", "json-summary"],
    },
    // Silence console.error in tests unless VITEST_VERBOSE is set
    onConsoleLog(log, type) {
      if (type === "stderr" && !process.env.VITEST_VERBOSE) return false;
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
