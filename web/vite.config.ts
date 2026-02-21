import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 10001,
    proxy: {
      "/api": "http://server:10000",
    },
  },
});
