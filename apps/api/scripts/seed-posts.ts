// One-off: insert the 2 community posts that failed validation on first seed.
// BismiLLAH Ar-Rahman Ar-Roheem. Idempotent: skips if posts already exist.
import { db } from '../src/lib/provider/index.js';

(async () => {
  try {
    await db.initializeSchema();
    const existing = await db.count('posts');
    if (existing > 0) {
      console.log(`[seed-posts] Posts already exist (${existing}), skipping.`);
      process.exit(0);
    }
    const sellers = await db.getAll<any>('users', { role: 'seller' });
    const seller1 = sellers.find((s) => s.email === 'seller1@goshop.com') || sellers[0];
    const seller2 = sellers.find((s) => s.email === 'seller2@goshop.com') || sellers[1];
    const stores = await db.getAll<any>('stores');
    const store1 = stores.find((s) => s.sellerId === seller1?.id) || stores[0];
    const store2 = stores.find((s) => s.sellerId === seller2?.id) || stores[1];
    const products = await db.getAll<any>('products');
    const p0 = products[0];
    const p6 = products[6];
    if (seller1 && store1) {
      await db.insert('posts', {
        userId: seller1.id, userName: seller1.name, role: 'seller',
        content: 'Just restocked our best-selling wireless earbuds! Grab yours at 37% off this week.',
        productIds: p0 ? [p0.id] : [], storeId: store1.id, likes: 42, comments: 8,
        tags: ['electronics', 'deals'], status: 'published',
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800'],
      });
    }
    if (seller2 && store2) {
      await db.insert('posts', {
        userId: seller2.id, userName: seller2.name, role: 'seller',
        content: 'New Ankara collection dropping soon! Handcrafted with premium fabric. Stay tuned.',
        productIds: p6 ? [p6.id] : [], storeId: store2.id, likes: 67, comments: 15,
        tags: ['fashion', 'ankara'], status: 'published',
        images: ['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800'],
      });
    }
    console.log('[seed-posts] Posts inserted.');
    process.exit(0);
  } catch (err: any) {
    console.error('[seed-posts] failed:', err?.message || err);
    process.exit(1);
  }
})();
