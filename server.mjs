// GoShop Beta — Unified production server.
// BismiLLAH Ar-Rahman Ar-Roheem. Serves the Vite SPA (static) + proxies /api/* to the Astro API.
// Single process, single port — ideal for PaaS (BirrPass / systemd).
//
// Usage: node server.mjs  (after `npm run build`)
// Env: PORT (default 3000), HOST (default 0.0.0.0)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SPA_DIR = join(process.cwd(), 'dist');
const API_ENTRY = join(process.cwd(), 'apps/api/dist/server/entry.mjs');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

// Load the Astro API handler (built standalone server).
let apiHandler = null;
try {
  if (existsSync(API_ENTRY)) {
    const api = await import(API_ENTRY);
    apiHandler = api.handler || api.default?.handler || api.default;
    console.log(`[server] Astro API handler loaded from ${API_ENTRY}`);
  } else {
    console.warn(`[server] WARNING: Astro API entry not found at ${API_ENTRY}. API routes will 404. Run "npm run build" first.`);
  }
} catch (err) {
  console.error(`[server] Failed to load Astro API handler:`, err?.message || err);
}

async function serveStatic(req, res, filePath) {
  try {
    const data = await readFile(filePath);
    const mime = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  // 1. API requests -> forward to the Astro handler.
  if (pathname.startsWith('/api')) {
    if (apiHandler) {
      return apiHandler(req, res);
    }
    res.writeHead(502, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API server not available' }));
  }

  // 2. Static assets (with cache-busting hashes).
  const staticPath = normalize(join(SPA_DIR, pathname));
  if (staticPath.startsWith(SPA_DIR)) {
    // Try the exact file.
    if (existsSync(staticPath)) {
      const s = await stat(staticPath);
      if (s.isFile()) {
        const ok = await serveStatic(req, res, staticPath);
        if (ok) return;
      }
    }
    // Try with /index.html inside a directory (e.g. /locales/en/translation.json).
    const indexPath = join(staticPath, 'index.html');
    if (existsSync(indexPath)) {
      const ok = await serveStatic(req, res, indexPath);
      if (ok) return;
    }
  }

  // 3. SPA fallback — serve index.html for all other routes (client-side routing).
  const indexFile = join(SPA_DIR, 'index.html');
  if (existsSync(indexFile)) {
    const ok = await serveStatic(req, res, indexFile);
    if (ok) return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`[server] GoShop Beta listening on http://${HOST}:${PORT}`);
  console.log(`[server] SPA dir: ${SPA_DIR}`);
  console.log(`[server] API: ${apiHandler ? 'active' : 'NOT loaded (build the API first)'}`);
});

// Graceful shutdown.
const shutdown = (sig) => {
  console.log(`[server] ${sig} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
