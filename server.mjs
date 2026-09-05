// GoShop Beta — plain Node static server (fallback host tier).
// BismiLLAH Ar-Rahman Ar-Roheem. Serves the built SPA (dist/) with SPA
// fallback routing. ZERO API surface lives here: the app is 100% static and
// every dynamic call goes to lightbase directly (see src/lib/lightbase-config.ts
// and edge-functions/). This server exists only to keep the app portable to a
// plain Node host (VPS / Docker / AppSail) if the static CDN tier is ever
// unavailable — it is NOT part of the Cloudflare Pages deployment.
//
// Usage: npm run build && node server.mjs
// Env: PORT (default 3000), HOST (default 0.0.0.0)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SPA_DIR = join(process.cwd(), 'dist');

const MIME = {
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

  // Static assets (with cache-busting hashes).
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

  // SPA fallback — serve index.html for all other routes (client-side routing).
  const indexFile = join(SPA_DIR, 'index.html');
  if (existsSync(indexFile)) {
    const ok = await serveStatic(req, res, indexFile);
    if (ok) return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`[server] GoShop Beta (static) listening on http://${HOST}:${PORT}`);
  console.log(`[server] SPA dir: ${SPA_DIR}`);
  console.log('[server] API: none (static tier) — dynamic work lives in lightbase');
});

// Graceful shutdown.
const shutdown = (sig) => {
  console.log(`[server] ${sig} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
