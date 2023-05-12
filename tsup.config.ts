import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/lib/tailwind/index.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  splitting: true,
  shims: true,
  minify: true,
  sourcemap: true,
  outDir: "dist/server",
});
