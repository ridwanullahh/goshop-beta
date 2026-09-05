import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// 100% static SPA build (zero CF Workers / Pages Functions). Every dynamic
// call goes to lightbase directly — see src/lib/lightbase-config.ts and
// edge-functions/ (Edge Function sources).
export default defineConfig(() => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    fs: {
      // Restrict served files to the project; block sandbox infrastructure folders.
      deny: [".zscripts", "skills", "upload", "tool-results"],
    },
  },
  optimizeDeps: {
    // Only scan the real app entry; avoid scanning sandbox HTML in skills/, docs/, etc.
    entries: ["index.html"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
