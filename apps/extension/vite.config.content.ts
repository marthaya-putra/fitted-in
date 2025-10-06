import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false, // don't wipe previous dist
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/index.tsx"),
      },
      output: {
        // IIFE so content.js is self-contained and has no `import` at runtime
        format: "iife",
        entryFileNames: "content.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  publicDir: false, // content build doesn't need to copy manifest/icons
});
