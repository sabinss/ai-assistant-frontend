import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  globalName: "CowrkrEmbed",
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  treeshake: true,
  outExtension({ format }) {
    if (format === "iife") return { js: ".global.js" }
    if (format === "cjs") return { js: ".js" }
    return { js: ".mjs" }
  },
})
