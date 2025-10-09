import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // mantém apenas o Met (funciona local e no Netlify)
      "/met": {
        target: "https://collectionapi.metmuseum.org/public/collection/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/met/, ""),
      },
    },
  },
});
