import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Path A (functions surface audit): copy functions/_routes.json into dist/ so
// Cloudflare Pages uses our MINIMAL include list — LEGACY PATH, opt-in via
// DEPLOY_TARGET=cloudflare. Slate (default) must NOT receive _routes.json. (only /api/* — the one surface
// the functions/ directory actually serves) instead of auto-generating one.
// Static storefront assets are never matched by the include list, so they are
// always served from the Pages CDN and never invoke the Function.
function copyFunctionsRoutes() {
  return {
    name: "copy-functions-routes-json",
    closeBundle() {
      if (process.env.DEPLOY_TARGET !== "cloudflare") return; // Slate path: skip CF artifact
      try {
        const src = path.resolve(__dirname, "functions/_routes.json");
        const outDir = path.resolve(__dirname, "dist");
        if (!fs.existsSync(src) || !fs.existsSync(outDir)) return;
        const parsed = JSON.parse(fs.readFileSync(src, "utf-8"));
        if (Array.isArray(parsed.include) && parsed.include.includes("/*")) {
          throw new Error("functions/_routes.json must not contain a catch-all /* include");
        }
        fs.writeFileSync(path.join(outDir, "_routes.json"), JSON.stringify(parsed, null, 2));
      } catch (err) {
        // Fail the build loudly: a wrong _routes.json burns the free-tier quota.
        throw err;
      }
    },
  };
}

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
    copyFunctionsRoutes(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
