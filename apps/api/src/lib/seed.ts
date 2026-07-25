// Comprehensive async seed for GoShop Beta (provider-agnostic).
// BismiLLAH Ar-Rahman Ar-Roheem. Idempotent: skips if users already exist.
// Seeds platform admin, sellers, customers, an affiliate, stores, categories, rich products,
// languages, currencies, platform commission, seller agreement, sample orders, wallets,
// transactions, reviews, help articles, blog posts, notifications, community posts and
// inherent referral codes for every user (no standalone referral account required).

import bcrypt from 'bcryptjs';
import { db } from './provider/index.js';

const hashSync = (pw: string) => bcrypt.hashSync(pw, 12);

function genReferralCode(name: string): string {
  const base = (name || 'USER').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'USER';
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

async function trySeed(label: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (err: any) {
    console.error(`[seed] ${label} failed:`, err?.message || err);
  }
}

export async function seedDatabase(): Promise<void> {
  await db.initializeSchema();

  const userCount = await db.count('users');
  if (userCount > 0) {
    console.log('[seed] Users already present, skipping seed.');
    return;
  }

  console.log('[seed] Seeding database...');

  // ---- Users ----
  const admin = await db.insert('users', {
    email: 'admin@goshop.com', passwordHash: hashSync('Admin@123'),
    name: 'Platform Admin', firstName: 'Admin', lastName: 'GoShop',
    role: 'admin', roles: ['admin'], verified: true, onboardingCompleted: true,
    phone: '+2348000000000', walletBalance: 0,
    referralCode: genReferralCode('Platform Admin'),
  });

  const seller1 = await db.insert('users', {
    email: 'seller1@goshop.com', passwordHash: hashSync('Seller@123'),
    name: 'Ahmad Electronics', firstName: 'Ahmad', lastName: 'Ibrahim',
    role: 'seller', roles: ['seller'], businessName: 'Ahmad Electronics Store',
    phone: '+2348012345678', verified: true, onboardingCompleted: true, walletBalance: 5000,
    referralCode: genReferralCode('Ahmad Electronics'),
  });

  const seller2 = await db.insert('users', {
    email: 'seller2@goshop.com', passwordHash: hashSync('Seller@123'),
    name: 'Fatima Fashion House', firstName: 'Fatima', lastName: 'Abdullah',
    role: 'seller', roles: ['seller'], businessName: 'Fatima Fashion House',
    phone: '+2348023456789', verified: true, onboardingCompleted: true, walletBalance: 3200,
    referralCode: genReferralCode('Fatima Fashion'),
  });

  const seller3 = await db.insert('users', {
    email: 'seller3@goshop.com', passwordHash: hashSync('Seller@123'),
    name: 'TechMart Nigeria', firstName: 'Usman', lastName: 'Hassan',
    role: 'seller', roles: ['seller'], businessName: 'TechMart Nigeria',
    phone: '+2348034567890', verified: true, onboardingCompleted: true, walletBalance: 4100,
    referralCode: genReferralCode('TechMart Nigeria'),
  });

  const customer1 = await db.insert('users', {
    email: 'customer@goshop.com', passwordHash: hashSync('Customer@123'),
    name: 'John Doe', firstName: 'John', lastName: 'Doe',
    role: 'customer', roles: ['customer'], phone: '+2348045678901',
    verified: true, onboardingCompleted: true, walletBalance: 250,
    referralCode: genReferralCode('John Doe'),
  });

  const customer2 = await db.insert('users', {
    email: 'customer2@goshop.com', passwordHash: hashSync('Customer@123'),
    name: 'Aisha Mohammed', firstName: 'Aisha', lastName: 'Mohammed',
    role: 'customer', roles: ['customer'], phone: '+2348056789012',
    verified: true, onboardingCompleted: true, walletBalance: 100,
    referralCode: genReferralCode('Aisha Mohammed'),
  });

  const customer3 = await db.insert('users', {
    email: 'customer3@goshop.com', passwordHash: hashSync('Customer@123'),
    name: 'David Okafor', firstName: 'David', lastName: 'Okafor',
    role: 'customer', roles: ['customer'], phone: '+2348067890123',
    verified: true, onboardingCompleted: true, walletBalance: 75,
    referredBy: customer1.id,
    referralCode: genReferralCode('David Okafor'),
  });

  const affiliate = await db.insert('users', {
    email: 'affiliate@goshop.com', passwordHash: hashSync('Affiliate@123'),
    name: 'Marketing Pro', firstName: 'Ali', lastName: 'Yusuf',
    role: 'affiliate', roles: ['affiliate'], businessName: 'Marketing Pro Agency',
    phone: '+2348078901234', verified: true, onboardingCompleted: true, walletBalance: 800,
    referralCode: genReferralCode('Marketing Pro'),
  });

  const users = { admin, seller1, seller2, seller3, customer1, customer2, customer3, affiliate };

  // ---- Referral codes (inherent per user) ----
  await trySeed('referral_codes', async () => {
    for (const u of Object.values(users)) {
      await db.insert('referral_codes', {
        userId: u.id, code: u.referralCode, userType: u.role,
        clicks: Math.floor(Math.random() * 200), signups: Math.floor(Math.random() * 20),
        earnings: Math.floor(Math.random() * 500), isActive: true,
      });
    }
  });

  // ---- Categories ----
  await trySeed('categories', async () => {
    const cats = [
      { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets, phones, laptops, and electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600', icon: 'Smartphone' },
      { name: 'Fashion', slug: 'fashion', description: 'Trending clothing, shoes, and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600', icon: 'Shirt' },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement, furniture, and garden supplies', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', icon: 'Home' },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment, fitness gear, and outdoor accessories', image: 'https://images.unsplash.com/photo-1461896836934-bffe45c26f59?w=600', icon: 'Dumbbell' },
      { name: 'Books', slug: 'books', description: 'Books, educational materials, and stationery', image: 'https://images.unsplash.com/photo-1495446815901-a7140bf12869?w=600', icon: 'BookOpen' },
      { name: 'Health & Beauty', slug: 'health-beauty', description: 'Skincare, cosmetics, and health products', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600', icon: 'Heart' },
      { name: 'Food & Groceries', slug: 'food-groceries', description: 'Fresh groceries, packaged food, and beverages', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', icon: 'ShoppingBasket' },
      { name: 'Automotive', slug: 'automotive', description: 'Car parts, accessories, and automotive tools', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600', icon: 'Car' },
    ];
    for (const c of cats) await db.insert('categories', { ...c, isActive: true, sortOrder: 0 });
  });

  // ---- Stores ----
  const store1 = await db.insert('stores', {
    name: 'Ahmad Electronics Store', slug: 'ahmad-electronics',
    description: 'Your one-stop shop for the latest electronics, gadgets, and tech accessories. We offer authentic products with warranty and fast nationwide delivery.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    banner: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200',
    sellerId: seller1.id, ownerId: seller1.id, isApproved: true, isActive: true, isVerified: true,
    location: 'Lagos, Nigeria', established: '2020', phone: '+2348012345678', email: 'ahmad@electronics.com',
    productCount: 8, rating: 4.5, reviewCount: 120, totalSales: 45000, businessType: 'Electronics Retail',
    socialMedia: { facebook: 'ahmadelectronics', instagram: '@ahmadelectronics', twitter: '@ahmadelec' },
    policies: { shipping: 'Free shipping on orders above $50. Standard delivery 3-5 business days.', returns: '30-day return policy for defective items.' },
    categories: ['electronics'], tags: ['electronics', 'gadgets', 'tech'],
    bannerImages: ['https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200'],
  });

  const store2 = await db.insert('stores', {
    name: 'Fatima Fashion House', slug: 'fatima-fashion',
    description: 'Premium fashion for men and women. African-inspired designs with modern twists. Handcrafted with love by skilled artisans.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    banner: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    sellerId: seller2.id, ownerId: seller2.id, isApproved: true, isActive: true, isVerified: true,
    location: 'Abuja, Nigeria', established: '2019', phone: '+2348023456789', email: 'fatima@fashion.com',
    productCount: 6, rating: 4.8, reviewCount: 89, totalSales: 32000, businessType: 'Fashion Design',
    socialMedia: { instagram: '@fatimafashionhouse', twitter: '@fatimafashion' },
    policies: { shipping: 'Free shipping within Nigeria. International shipping available.', returns: '14-day return for unworn items.' },
    categories: ['fashion'], tags: ['fashion', 'african', 'designer'],
    bannerImages: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200'],
  });

  const store3 = await db.insert('stores', {
    name: 'TechMart Nigeria', slug: 'techmart-ng',
    description: 'Authorized dealer of computers, laptops, and networking equipment. Enterprise solutions and after-sales support available nationwide.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    banner: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
    sellerId: seller3.id, ownerId: seller3.id, isApproved: true, isActive: true, isVerified: true,
    location: 'Port Harcourt, Nigeria', established: '2021', phone: '+2348034567890', email: 'info@techmart.ng',
    productCount: 5, rating: 4.3, reviewCount: 67, totalSales: 28000, businessType: 'IT Solutions',
    socialMedia: { facebook: 'techmartng', instagram: '@techmartng' },
    policies: { shipping: 'Nationwide delivery within 2-5 business days.', returns: '7-day return for unopened items.' },
    categories: ['electronics'], tags: ['computers', 'laptops', 'networking'],
    bannerImages: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200'],
  });

  // ---- Products ----
  const productDefs = [
    { name: 'Wireless Bluetooth Earbuds Pro', description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX7 waterproof rating. Compatible with all devices. Crystal-clear calls with built-in mic.', price: 49.99, originalPrice: 79.99, discount: 37.5, category: 'Electronics', seller: seller1, store: store1, inventory: 150, isFeatured: true, rating: 4.7, reviewCount: 234, soldCount: 890, sku: 'WB-EP-001', tags: ['wireless', 'earbuds', 'bluetooth', 'audio'], images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'], shippingCost: 5, affiliateEnabled: true, affiliateCommission: 10, brand: 'SoundCore', specifications: { battery: '30 hours', waterproof: 'IPX7', connectivity: 'Bluetooth 5.3' } },
    { name: 'Smart Watch Series X', description: 'Advanced smartwatch with health monitoring, GPS tracking, heart rate sensor, blood oxygen, and 7-day battery life. Water resistant to 50m. Premium AMOLED display.', price: 129.99, originalPrice: 199.99, discount: 35, category: 'Electronics', seller: seller1, store: store1, inventory: 80, isFeatured: true, rating: 4.5, reviewCount: 156, soldCount: 420, sku: 'SW-SX-002', tags: ['smartwatch', 'fitness', 'health'], images: ['https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'], shippingCost: 8, affiliateEnabled: true, affiliateCommission: 8, brand: 'TechWear', specifications: { display: '1.4" AMOLED', battery: '7 days', waterResistance: '50m' } },
    { name: 'Portable Power Bank 20000mAh', description: 'Fast charging power bank with dual USB-C ports, LED display, and airline-approved capacity. Charges 3 devices simultaneously. Pass-through charging supported.', price: 34.99, originalPrice: 54.99, discount: 36, category: 'Electronics', seller: seller1, store: store1, inventory: 200, isFeatured: true, rating: 4.6, reviewCount: 312, soldCount: 1200, sku: 'PB-20K-003', tags: ['powerbank', 'charging', 'portable'], images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'], shippingCost: 3, affiliateEnabled: true, affiliateCommission: 12, brand: 'AnkerPro', specifications: { capacity: '20000mAh', ports: '2x USB-C, 1x USB-A', output: 'PD 30W' } },
    { name: '4K Action Camera Waterproof', description: 'Ultra HD 4K action camera with electronic image stabilization, waterproof to 40m, WiFi connectivity, and 170-degree wide angle lens. Includes mounting accessories.', price: 89.99, originalPrice: 149.99, discount: 40, category: 'Electronics', seller: seller1, store: store1, inventory: 60, isFeatured: false, rating: 4.4, reviewCount: 89, soldCount: 320, sku: 'AC-4K-004', tags: ['camera', 'action', '4k', 'waterproof'], images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf73499f?w=800'], shippingCost: 6, brand: 'GoCapture', specifications: { resolution: '4K 60fps', waterproof: '40m', lens: '170deg wide' } },
    { name: 'USB-C Hub 7-in-1 Adapter', description: 'Multi-port USB-C hub with HDMI 4K output, USB 3.0, SD card reader, and 100W power delivery pass-through. Compact aluminum design.', price: 29.99, originalPrice: 44.99, discount: 33, category: 'Electronics', seller: seller3, store: store3, inventory: 120, isFeatured: false, rating: 4.3, reviewCount: 67, soldCount: 450, sku: 'HB-7IN1-005', tags: ['usb-c', 'hub', 'adapter'], images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800'], shippingCost: 3, brand: 'TechMart', specifications: { ports: 'HDMI, USB 3.0, SD, PD', material: 'Aluminum' } },
    { name: 'Mechanical Gaming Keyboard RGB', description: 'Full-size mechanical keyboard with hot-swappable Cherry MX switches, per-key RGB lighting, N-key rollover, and detachable wrist rest. Premium aluminum frame.', price: 79.99, originalPrice: 119.99, discount: 33, category: 'Electronics', seller: seller3, store: store3, inventory: 45, isFeatured: true, rating: 4.8, reviewCount: 201, soldCount: 560, sku: 'KB-MEC-006', tags: ['keyboard', 'gaming', 'mechanical', 'rgb'], images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'], shippingCost: 7, affiliateEnabled: true, affiliateCommission: 8, brand: 'RazerKey', specifications: { switches: 'Cherry MX', layout: 'Full-size', backlight: 'Per-key RGB' } },
    { name: 'African Print Ankara Dress', description: 'Beautiful handmade Ankara print dress with modern cut design. Perfect for parties and special occasions. Available in multiple sizes. Premium cotton fabric.', price: 59.99, originalPrice: 89.99, discount: 33, category: 'Fashion', seller: seller2, store: store2, inventory: 30, isFeatured: true, rating: 4.9, reviewCount: 45, soldCount: 180, sku: 'DR-ANK-007', tags: ['ankara', 'african', 'dress', 'handmade'], images: ['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800'], shippingCost: 5, affiliateEnabled: true, affiliateCommission: 15, brand: 'Fatima House', specifications: { material: '100% Cotton Ankara', care: 'Hand wash' } },
    { name: 'Handwoven Leather Sandals', description: 'Premium handcrafted leather sandals with cushioned sole. Traditional Nigerian craftsmanship meets modern comfort. Durable and breathable.', price: 39.99, originalPrice: 59.99, discount: 33, category: 'Fashion', seller: seller2, store: store2, inventory: 50, isFeatured: false, rating: 4.6, reviewCount: 78, soldCount: 290, sku: 'SD-LTH-008', tags: ['sandals', 'leather', 'handmade'], images: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800'], shippingCost: 4, brand: 'Fatima House', specifications: { material: 'Genuine Leather' } },
    { name: 'Embroidered Agbada Set', description: 'Luxurious 3-piece Agbada set with intricate embroidery. Includes Agbada, inner top, and trousers. Perfect for ceremonies and special occasions. Tailored fit.', price: 149.99, originalPrice: 249.99, discount: 40, category: 'Fashion', seller: seller2, store: store2, inventory: 20, isFeatured: true, rating: 4.8, reviewCount: 34, soldCount: 95, sku: 'AG-EMB-009', tags: ['agbada', 'traditional', 'ceremony'], images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'], shippingCost: 8, affiliateEnabled: true, affiliateCommission: 12, brand: 'Fatima House', specifications: { pieces: '3-piece', material: 'Premium Cotton' } },
    { name: 'Wireless Charging Pad 15W', description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and anti-slip surface. Over-charge protection.', price: 19.99, originalPrice: 34.99, discount: 43, category: 'Electronics', seller: seller1, store: store1, inventory: 300, isFeatured: false, rating: 4.2, reviewCount: 156, soldCount: 780, sku: 'WC-15W-010', tags: ['wireless', 'charging', 'qi'], images: ['https://images.unsplash.com/photo-1591290619762-c1e9275e3a36?w=800'], shippingCost: 2, affiliateEnabled: true, affiliateCommission: 15, brand: 'AnkerPro', specifications: { power: '15W', compatibility: 'Qi' } },
    { name: 'Fitness Yoga Mat Premium', description: 'Extra thick 6mm yoga mat with non-slip surface, carrying strap included. Eco-friendly TPE material. Moisture-resistant for easy cleaning.', price: 24.99, originalPrice: 39.99, discount: 37, category: 'Sports', seller: seller3, store: store3, inventory: 100, isFeatured: false, rating: 4.5, reviewCount: 89, soldCount: 340, sku: 'YM-PRM-011', tags: ['yoga', 'fitness', 'exercise'], images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'], shippingCost: 5, brand: 'FlexFit', specifications: { thickness: '6mm', material: 'TPE' } },
    { name: 'Organic Shea Butter Cream', description: 'Pure unrefined organic shea butter from Nigeria. Multi-purpose moisturizer for skin and hair. 250ml jar. No additives or preservatives.', price: 14.99, originalPrice: 24.99, discount: 40, category: 'Health & Beauty', seller: seller2, store: store2, inventory: 200, isFeatured: true, rating: 4.7, reviewCount: 234, soldCount: 890, sku: 'SB-ORG-012', tags: ['shea butter', 'organic', 'skincare'], images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800'], shippingCost: 3, affiliateEnabled: true, affiliateCommission: 20, brand: 'Naija Naturals', specifications: { size: '250ml', type: 'Unrefined' } },
    { name: 'Smart Home Speaker with AI', description: 'Voice-controlled smart speaker with premium 360-degree sound, built-in AI assistant, and multi-room audio support. Smart home hub integration.', price: 69.99, originalPrice: 99.99, discount: 30, category: 'Electronics', seller: seller1, store: store1, inventory: 75, isFeatured: true, rating: 4.4, reviewCount: 123, soldCount: 410, sku: 'SP-AI-013', tags: ['smart speaker', 'ai', 'voice'], images: ['https://images.unsplash.com/photo-1543512214-318c7553f230?w=800'], shippingCost: 5, affiliateEnabled: true, affiliateCommission: 10, brand: 'EchoHome', specifications: { connectivity: 'WiFi, Bluetooth', assistant: 'Built-in AI' } },
    { name: 'Laptop Backpack Anti-Theft', description: 'Anti-theft laptop backpack with USB charging port, waterproof fabric, hidden zippers, and padded laptop compartment for up to 15.6" laptops. Ergonomic design.', price: 44.99, originalPrice: 69.99, discount: 36, category: 'Fashion', seller: seller2, store: store2, inventory: 90, isFeatured: false, rating: 4.6, reviewCount: 167, soldCount: 520, sku: 'BP-ANT-014', tags: ['backpack', 'laptop', 'anti-theft'], images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'], shippingCost: 5, affiliateEnabled: true, affiliateCommission: 10, brand: 'UrbanPack', specifications: { capacity: '25L', laptop: '15.6"', material: 'Waterproof' } },
    { name: 'Ergonomic Office Chair', description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, breathable mesh back, and 360-degree swivel. Built for all-day comfort.', price: 199.99, originalPrice: 349.99, discount: 43, category: 'Home & Garden', seller: seller3, store: store3, inventory: 25, isFeatured: true, rating: 4.7, reviewCount: 89, soldCount: 150, sku: 'CH-ERG-015', tags: ['office', 'chair', 'ergonomic'], images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800'], shippingCost: 15, affiliateEnabled: true, affiliateCommission: 5, brand: 'ComfortPro', specifications: { material: 'Mesh', adjustability: 'Lumbar, armrest, height' } },
    { name: 'LED Desk Lamp with Wireless Charger', description: 'Multi-function LED desk lamp with 5 brightness levels, color temperature control, built-in wireless phone charger, and USB port. Eye-friendly flicker-free light.', price: 39.99, originalPrice: 64.99, discount: 38, category: 'Home & Garden', seller: seller1, store: store1, inventory: 110, isFeatured: false, rating: 4.5, reviewCount: 98, soldCount: 380, sku: 'DL-LED-016', tags: ['desk lamp', 'led', 'wireless charger'], images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'], shippingCost: 5, affiliateEnabled: true, affiliateCommission: 12, brand: 'BrightHome', specifications: { brightness: '5 levels', charging: '10W wireless' } },
    { name: 'Stainless Steel Cookware Set', description: 'Premium 10-piece stainless steel cookware set with tri-ply construction for even heat distribution. Induction compatible and dishwasher safe.', price: 119.99, originalPrice: 189.99, discount: 37, category: 'Home & Garden', seller: seller3, store: store3, inventory: 40, isFeatured: true, rating: 4.6, reviewCount: 56, soldCount: 210, sku: 'CK-SS-017', tags: ['cookware', 'kitchen', 'stainless steel'], images: ['https://images.unsplash.com/photo-1584990347449-a05d6e8a6f6e?w=800'], shippingCost: 12, brand: 'ChefMaster', specifications: { pieces: '10', material: 'Stainless Steel', induction: 'Yes' } },
    { name: 'Running Shoes Lightweight', description: 'Breathable lightweight running shoes with cushioned sole and ergonomic fit. Perfect for daily runs and gym workouts. Available in multiple colors.', price: 54.99, originalPrice: 84.99, discount: 35, category: 'Sports', seller: seller3, store: store3, inventory: 70, isFeatured: true, rating: 4.5, reviewCount: 134, soldCount: 480, sku: 'RS-LW-018', tags: ['running', 'shoes', 'sports'], images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'], shippingCost: 6, affiliateEnabled: true, affiliateCommission: 8, brand: 'SprintPro', specifications: { material: 'Mesh/Rubber', use: 'Running' } },
  ];

  const insertedProducts: any[] = [];
  await trySeed('products', async () => {
    for (const p of productDefs) {
      const { seller, store, ...rest } = p;
      const created = await db.insert('products', {
        ...rest, sellerId: seller.id, sellerName: seller.businessName || seller.name, storeId: store.id,
        isActive: true, type: 'simple', shippingEnabled: true, currency: 'USD',
      });
      insertedProducts.push(created);
    }
  });

  // ---- Languages ----
  await trySeed('languages', async () => {
    const langs = [
      { code: 'en', name: 'English', nativeName: 'English', flag: 'GB', rtl: false },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR', rtl: false },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES', rtl: false },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE', rtl: false },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: 'CN', rtl: false },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'SA', rtl: true },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'IN', rtl: false },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT', rtl: false },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU', rtl: false },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JP', rtl: false },
      { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: 'NG', rtl: false },
      { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'KE', rtl: false },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR', rtl: false },
    ];
    for (const l of langs) await db.insert('languages', l);
  });

  // ---- Currencies ----
  await trySeed('currencies', async () => {
    const curs = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1 },
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', exchangeRate: 1500 },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92 },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 157.64 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.25 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.54 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.37 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.51 },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R', exchangeRate: 18.78 },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', exchangeRate: 5.37 },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺', exchangeRate: 32.5 },
    ];
    for (const c of curs) await db.insert('currencies', c);
  });

  // ---- Platform commission + seller agreement ----
  await trySeed('platform_settings', async () => {
    await db.insert('platform_commissions', { percentage: 5, isGlobal: true });
    await db.insert('seller_agreements', {
      version: 'v1', isActive: true,
      content: '# Seller Agreement\n\nBy registering as a seller on GoShop, you agree to:\n\n- Platform commission: 5% per sale\n- Deliver products as described\n- Maintain accurate inventory\n- Respond to customer inquiries within 24 hours\n- Honor valid refund requests\n\nThis agreement may be updated from time to time.',
      variables: { platform_name: 'GoShop', commission_percentage: '5' },
    });
  });

  // ---- Wallets + transactions ----
  const walletMap: Record<string, any> = {};
  await trySeed('wallets', async () => {
    for (const [key, u] of Object.entries(users)) {
      const w = await db.insert('wallets', { userId: u.id, balance: u.walletBalance || 0 });
      walletMap[key] = w;
    }
    // Sample transaction
    if (walletMap.customer1) {
      await db.insert('transactions', {
        walletId: walletMap.customer1.id, amount: 250, type: 'credit',
        description: 'Wallet top-up', status: 'completed',
      });
    }
    if (walletMap.seller1) {
      await db.insert('transactions', {
        walletId: walletMap.seller1.id, amount: 1200, type: 'credit',
        description: 'Payout for order sales', status: 'completed',
      });
    }
  });

  // ---- Orders ----
  await trySeed('orders', async () => {
    const p0 = insertedProducts[0];
    const p6 = insertedProducts[6];
    const p11 = insertedProducts[11];
    const p5 = insertedProducts[5];
    if (p0) {
      await db.insert('orders', {
        userId: customer1.id,
        items: [{ productId: p0.id, quantity: 2, price: p0.price, name: p0.name, images: p0.images, sellerId: seller1.id, shippingCost: 5, deliveryMethod: 'shipping', status: 'delivered' }],
        total: 104.98, subtotal: 99.98, shippingTotal: 5, status: 'delivered', paymentStatus: 'completed',
        paymentMethod: 'paystack', sellerId: seller1.id, transactionRef: 'goshop_seed_001',
        shippingAddress: { street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria', firstName: 'John', lastName: 'Doe', phone: '+2348045678901' },
        billingAddress: { street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria' },
        deliveredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      });
    }
    if (p6 && p11) {
      await db.insert('orders', {
        userId: customer2.id,
        items: [
          { productId: p6.id, quantity: 1, price: p6.price, name: p6.name, images: p6.images, sellerId: seller2.id, shippingCost: 5, deliveryMethod: 'shipping', status: 'shipped' },
          { productId: p11.id, quantity: 2, price: p11.price, name: p11.name, images: p11.images, sellerId: seller2.id, shippingCost: 3, deliveryMethod: 'shipping', status: 'shipped' },
        ],
        total: 94.97, subtotal: 89.97, shippingTotal: 5, status: 'shipped', paymentStatus: 'completed',
        paymentMethod: 'wallet', sellerId: seller2.id, transactionRef: 'goshop_seed_002',
        shippingAddress: { street: '456 Abuja Rd', city: 'Abuja', state: 'FCT', zip: '900001', country: 'Nigeria', firstName: 'Aisha', lastName: 'Mohammed', phone: '+2348056789012' },
        billingAddress: { street: '456 Abuja Rd', city: 'Abuja', state: 'FCT', zip: '900001', country: 'Nigeria' },
      });
    }
    if (p5) {
      await db.insert('orders', {
        userId: customer1.id,
        items: [{ productId: p5.id, quantity: 1, price: p5.price, name: p5.name, images: p5.images, sellerId: seller3.id, shippingCost: 7, deliveryMethod: 'shipping', status: 'processing' }],
        total: 86.99, subtotal: 79.99, shippingTotal: 7, status: 'processing', paymentStatus: 'completed',
        paymentMethod: 'cod', sellerId: seller3.id, transactionRef: 'goshop_seed_003',
        shippingAddress: { street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria', firstName: 'John', lastName: 'Doe', phone: '+2348045678901' },
        billingAddress: { street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria' },
      });
    }
  });

  // ---- Reviews ----
  await trySeed('reviews', async () => {
    const p0 = insertedProducts[0], p6 = insertedProducts[6], p5 = insertedProducts[5];
    if (p0) {
      await db.insert('reviews', { productId: p0.id, userId: customer1.id, userName: 'John Doe', rating: 5, title: 'Excellent earbuds!', content: 'Sound quality is amazing and battery lasts forever. Best purchase I have made.', isVerified: true });
      await db.insert('reviews', { productId: p0.id, userId: customer2.id, userName: 'Aisha Mohammed', rating: 4, title: 'Good quality', content: 'Works well, comfortable fit. Delivery was fast.', isVerified: true });
    }
    if (p6) {
      await db.insert('reviews', { productId: p6.id, userId: customer2.id, userName: 'Aisha Mohammed', rating: 5, title: 'Beautiful dress!', content: 'The Ankara print is stunning. Got many compliments at the party.', isVerified: true });
    }
    if (p5) {
      await db.insert('reviews', { productId: p5.id, userId: customer1.id, userName: 'John Doe', rating: 5, title: 'Perfect for gaming', content: 'Cherry MX switches feel great. RGB lighting is customizable.', isVerified: true });
    }
  });

  // ---- Help articles ----
  await trySeed('help_articles', async () => {
    const arts = [
      { title: 'Getting Started with GoShop', content: 'Welcome to GoShop! Create your account, browse products, add items to your cart, and checkout securely. We support multiple payment methods including Paystack, PayPal, Flutterwave, Razorpay, and wallet payments.', category: 'getting-started', slug: 'getting-started', isPublished: true },
      { title: 'How to Become a Seller', content: 'To become a seller on GoShop: 1. Register with seller role, 2. Complete your profile and business information, 3. Accept the seller agreement, 4. Start listing your products. Our team will review and approve your store.', category: 'seller-guide', slug: 'become-a-seller', isPublished: true },
      { title: 'Payment Methods', content: 'GoShop supports: Paystack (cards, bank transfer, USSD), PayPal, Flutterwave, Razorpay, Wallet payments, and Cash on Delivery. All online payments are encrypted and secure.', category: 'payments', slug: 'payment-methods', isPublished: true },
      { title: 'Shipping & Delivery', content: 'Delivery times vary by location. Lagos: 1-2 days. Other states: 3-5 days. International: 7-14 days. Track your order from your dashboard.', category: 'shipping', slug: 'shipping-delivery', isPublished: true },
    ];
    for (const a of arts) await db.insert('help_articles', a);
  });

  // ---- Blog posts ----
  await trySeed('blogs', async () => {
    const blogs = [
      { title: '5 Tech Gadgets That Will Upgrade Your 2025', slug: 'tech-gadgets-2025', excerpt: 'From smart home devices to wearables, here are the top gadgets to look out for.', content: 'Technology evolves rapidly. In 2025, smart home devices, wireless audio, and wearable health tech lead the way...', author: 'GoShop Team', authorId: admin.id, category: 'Technology', tags: ['tech', 'gadgets', '2025'], featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', isPublished: true },
      { title: 'African Fashion: Embracing Ankara in Modern Design', slug: 'ankara-modern-design', excerpt: 'How designers are blending traditional African prints with contemporary styles.', content: 'Ankara fabric has become a global fashion statement. Modern designers blend traditional prints with contemporary cuts...', author: 'Fatima Abdullah', authorId: seller2.id, storeId: store2.id, storeName: 'Fatima Fashion House', category: 'Fashion', tags: ['fashion', 'ankara', 'african'], featuredImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', isPublished: true },
    ];
    for (const b of blogs) await db.insert('blogs', b);
  });

  // ---- Notifications ----
  await trySeed('notifications', async () => {
    await db.insert('notifications', { userId: customer1.id, title: 'Welcome to GoShop!', message: 'Thank you for joining GoShop. Start exploring thousands of products from verified sellers.', type: 'success', read: false });
    await db.insert('notifications', { userId: customer1.id, title: 'Order Delivered', message: 'Your order has been delivered. Please leave a review!', type: 'info', read: false, link: '/customer-dashboard/orders' });
    await db.insert('notifications', { userId: seller1.id, title: 'New order received', message: 'You have received a new order. Please process it promptly.', type: 'info', read: false, link: '/seller-dashboard/orders' });
    await db.insert('notifications', { userId: admin.id, title: 'New seller registration', message: 'A new store is pending approval. Review it in the admin dashboard.', type: 'info', read: false, link: '/admin-dashboard' });
  });

  // ---- Community posts ----
  await trySeed('posts', async () => {
    await db.insert('posts', {
      userId: seller1.id, userName: seller1.name, role: 'seller',
      content: 'Just restocked our best-selling wireless earbuds! Grab yours at 37% off this week.', productIds: insertedProducts[0] ? [insertedProducts[0].id] : [], storeId: store1.id, likes: 42, comments: 8, tags: ['electronics', 'deals'], status: 'published', images: ['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800'],
    });
    await db.insert('posts', {
      userId: seller2.id, userName: seller2.name, role: 'seller',
      content: 'New Ankara collection dropping soon! Handcrafted with premium fabric. Stay tuned.', productIds: insertedProducts[6] ? [insertedProducts[6].id] : [], storeId: store2.id, likes: 67, comments: 15, tags: ['fashion', 'ankara'], status: 'published', images: ['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800'],
    });
  });

  console.log('[seed] Database seeded successfully.');
  console.log('[seed] Test accounts:');
  console.log('[seed]   Admin: admin@goshop.com / Admin@123');
  console.log('[seed]   Seller: seller1@goshop.com / Seller@123');
  console.log('[seed]   Customer: customer@goshop.com / Customer@123');
  console.log('[seed]   Affiliate: affiliate@goshop.com / Affiliate@123');
}
