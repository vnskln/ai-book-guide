/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@astrojs/react";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts", "./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "dist/**", ".astro/**", "src/test/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
