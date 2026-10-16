import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // testTimeout raised from the 5s default: the first cold import of pino on
  // Windows can exceed it and fail pnpm check on a clean checkout (logic is sync).
  test: { environment: "node", include: ["src/**/*.test.ts"], restoreMocks: true, testTimeout: 20_000 },
});
