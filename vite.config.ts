import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vinext from "vinext";

const root = path.dirname(fileURLToPath(import.meta.url));
const engineSrc = path.join(root, "packages/engine/src");

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@taka\/engine$/, replacement: path.join(engineSrc, "index.ts") },
      { find: /^@taka\/engine\/(.*)$/, replacement: `${engineSrc}/$1` },
    ],
  },
  plugins: [vinext()],
});
