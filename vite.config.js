import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ESM 문법으로 export
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Express 서버
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
