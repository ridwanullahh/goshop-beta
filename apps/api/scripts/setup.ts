// Standalone setup script: creates Lightbase collections + seeds data.
// BismiLLAH Ar-Rahman Ar-Roheem. Run via `bun run db:push` (root) before starting the dev server.
import { db } from '../src/lib/provider/index.js';
import { seedDatabase } from '../src/lib/seed.js';

(async () => {
  try {
    console.log('[setup] Initializing schema...');
    await db.initializeSchema();
    console.log('[setup] Seeding database...');
    await seedDatabase();
    console.log('[setup] Setup complete.');
    process.exit(0);
  } catch (err: any) {
    console.error('[setup] Setup failed:', err?.message || err);
    process.exit(1);
  }
})();
