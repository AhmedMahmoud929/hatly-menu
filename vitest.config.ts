import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
    env: {
      BASE_URL: process.env.BASE_URL || "http://localhost:3000",
    },
  },
});
