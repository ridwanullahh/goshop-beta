// Migration: update existing Lightbase users from non-Islamic names to Islamic names.
// BismiLLAH Ar-Rahman Ar-Roheem. Idempotent: only updates users whose name still contains the old values.
import { db } from '../src/lib/provider/index.js';

const RENAMES: Record<string, { name: string; firstName: string; lastName: string }> = {
  'customer@goshop.com': { name: 'Bilal Rahman', firstName: 'Bilal', lastName: 'Rahman' },
  'customer3@goshop.com': { name: 'Idris Suleiman', firstName: 'Idris', lastName: 'Suleiman' },
};

(async () => {
  try {
    await db.initializeSchema();
    const users = await db.getAll<any>('users');
    let updated = 0;
    for (const u of users) {
      const rename = RENAMES[u.email];
      if (!rename) continue;
      if (u.name === rename.name && u.firstName === rename.firstName) continue; // already updated
      await db.update('users', u.id, {
        name: rename.name,
        firstName: rename.firstName,
        lastName: rename.lastName,
      });
      console.log(`[migrate-names] Updated ${u.email}: ${u.name} -> ${rename.name}`);
      updated++;
    }
    // Also update reviews userName + order shippingAddress firstName/lastName that reference the old names.
    const reviews = await db.getAll<any>('reviews');
    for (const r of reviews) {
      let newName: string | null = null;
      if (r.userId) {
        const owner = users.find((u: any) => u.id === r.userId);
        if (owner && owner.name !== r.userName) newName = owner.name;
      }
      if (!newName && r.userName === 'John Doe') newName = 'Bilal Rahman';
      if (!newName && r.userName === 'David Okafor') newName = 'Idris Suleiman';
      if (newName) {
        await db.update('reviews', r.id, { userName: newName });
        updated++;
      }
    }
    const orders = await db.getAll<any>('orders');
    for (const o of orders) {
      const sa = o.shippingAddress;
      if (sa && (sa.firstName === 'John' || sa.firstName === 'David')) {
        const owner = users.find((u: any) => u.id === o.userId);
        if (owner) {
          await db.update('orders', o.id, {
            shippingAddress: { ...sa, firstName: owner.firstName, lastName: owner.lastName },
          });
          updated++;
        }
      }
    }
    console.log(`[migrate-names] Done. ${updated} records updated.`);
    process.exit(0);
  } catch (err: any) {
    console.error('[migrate-names] failed:', err?.message || err);
    process.exit(1);
  }
})();
