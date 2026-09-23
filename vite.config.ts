import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    fs: {
      allow: [fileURLToPath(new URL("..", import.meta.url))],
    },
    watch: {
      // Dependencies are built explicitly by `workspace:build`. Watching every
      // generated module causes rebuild storms in linked workspaces.
      ignored: ["**/.dependencies/**", "**/dist/**"],
    },
  },
  build: {
    target: "es2022",
  },
});
