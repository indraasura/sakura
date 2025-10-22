import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup/index.html")
      }
    },
    outDir: "dist",
    emptyOutDir: true
  },
  // Simple post-build copy
  plugins: [
    {
      name: "copy-static-files",
      closeBundle() {
        const filesToCopy = ["manifest.json", "background.js", "content.js"];
        mkdirSync("dist", { recursive: true });
        for (const file of filesToCopy) {
          try {
            copyFileSync(file, `dist/${file}`);
            console.log(`✅ Copied: ${file}`);
          } catch (err) {
            console.warn(`⚠️ Skipped ${file}: ${err.message}`);
          }
        }
      }
    }
  ]
});
