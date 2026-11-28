import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Same mapping as tsconfig.json "paths", so route handlers' "@/lib/..." imports resolve in tests (TASK-7, D6).
  resolve: { alias: { "@/": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["**/*.test.ts"], exclude: ["node_modules/**", ".next/**"] },
});
