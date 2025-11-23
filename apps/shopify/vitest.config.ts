import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.ts", "app/**/*.tsx"],
      exclude: [
        "app/routes/**/*.tsx", // Routes require Remix runtime
        "app/entry.*.tsx", // Entry points require Remix runtime
        "app/root.tsx", // Root requires Remix runtime
      ],
    },
  },
});
