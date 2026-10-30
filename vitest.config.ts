// Separate from vite.config.ts on purpose: tests must not boot vinext or the
// Cloudflare Vite plugin. Three projects: pure engine, app libs, API route handlers.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const engineSrc = path.join(root, "packages/engine/src");
const alias = [
  { find: /^@taka\/engine$/, replacement: path.join(engineSrc, "index.ts") },
  { find: /^@taka\/engine\/(.*)$/, replacement: `${engineSrc}/$1` },
  { find: /^@\/(.*)$/, replacement: `${root}/$1` },
];

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: { name: "engine", include: ["packages/engine/**/*.test.ts"], environment: "node" },
      },
      {
        resolve: { alias },
        test: { name: "lib", include: ["lib/**/*.test.{ts,tsx}", "test/**/*.test.ts"], environment: "node" },
      },
      {
        resolve: {
          alias: [...alias, { find: "cloudflare:workers", replacement: path.join(root, "test/stubs/cloudflare-workers.ts") }],
        },
        test: { name: "api", include: ["app/api/**/*.test.ts"], environment: "node" },
      },
    ],
  },
});
