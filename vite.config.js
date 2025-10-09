import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/met": {
        target: "https://collectionapi.metmuseum.org/public/collection/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/met/, ""),
      },
    },
  },
});
