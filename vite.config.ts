import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    proxy: {
      // Proxy API requests to the Astro backend (apps/api on port 3001).
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    fs: {
      // Restrict served files to the project; block sandbox infrastructure folders.
      deny: [".zscripts", "skills", "upload", "tool-results"],
    },
  },
  optimizeDeps: {
    // Only scan the real app entry; avoid scanning sandbox HTML in skills/, docs/, etc.
    entries: ["index.html"],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
