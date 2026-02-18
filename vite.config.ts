import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: true, // Allow all hosts (tunneling)
    proxy: {
      "/api": {
        target: "https://aivio.c-metric.net",
        changeOrigin: true,
        secure: false,
      },
      "/files": {
        target: "https://aivio.c-metric.net",
        changeOrigin: true,
        secure: false,
      },
      "/private": {
        target: "https://aivio.c-metric.net",
        changeOrigin: true,
        secure: false,
      },
      // Proxy for the QR API (HTTP) to avoid Mixed Content errors
      "/custom-api": {
        target: "http://202.131.111.246:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/custom-api/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
