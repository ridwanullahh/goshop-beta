import { initializeSchema, getDb, insert, getAll, count } from './database.js';

export function seedDatabase() {
  initializeSchema();

  if (count('users') > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const bcrypt = require('bcryptjs');
  const hashSync = (pw: string) => bcrypt.hashSync(pw, 12);

  // Admin user
  const admin = insert('users', {
    id: '1', email: 'admin@goshop.com', passwordHash: hashSync('Admin@123'),
    name: 'Platform Admin', firstName: 'Admin', lastName: 'GoShop',
    role: 'admin', roles: '["admin"]', verified: 1, onboardingCompleted: 1
  });

  // Seller users
  const seller1 = insert('users', {
    id: '2', email: 'seller1@goshop.com', passwordHash: hashSync('Seller@123'),
    name: 'Ahmad Electronics', firstName: 'Ahmad', lastName: 'Ibrahim',
    role: 'seller', roles: '["seller"]', businessName: 'Ahmad Electronics Store',
    phone: '+2348012345678', verified: 1, onboardingCompleted: 1
  });

  const seller2 = insert('users', {
    id: '3', email: 'seller2@goshop.com', passwordHash: hashSync('Seller@123'),
    name: 'Fatima Fashion House', firstName: 'Fatima', lastName: 'Abdullah',
    role: 'seller', roles: '["seller"]', businessName: 'Fatima Fashion House',
    phone: '+2348023456789', verified: 1, onboardingCompleted: 1
  });

  const seller3 = insert('users', {
    id: '4', email: 'seller3@goshop.com', passwordHash: hashSync('Seller@123'),
    name: 'TechMart Nigeria', firstName: 'Usman', lastName: 'Hassan',
    role: 'seller', roles: '["seller"]', businessName: 'TechMart Nigeria',
    phone: '+2348034567890', verified: 1, onboardingCompleted: 1
  });

  // Customer users
  const customer1 = insert('users', {
    id: '5', email: 'customer@goshop.com', passwordHash: hashSync('Customer@123'),
    name: 'John Doe', firstName: 'John', lastName: 'Doe',
    role: 'customer', roles: '["customer"]', phone: '+2348045678901',
    verified: 1, onboardingCompleted: 1
  });

  const customer2 = insert('users', {
    id: '6', email: 'customer2@goshop.com', passwordHash: hashSync('Customer@123'),
    name: 'Aisha Mohammed', firstName: 'Aisha', lastName: 'Mohammed',
    role: 'customer', roles: '["customer"]', phone: '+2348056789012',
    verified: 1, onboardingCompleted: 1
  });

  // Affiliate user
  insert('users', {
    id: '7', email: 'affiliate@goshop.com', passwordHash: hashSync('Affiliate@123'),
    name: 'Marketing Pro', firstName: 'Ali', lastName: 'Yusuf',
    role: 'affiliate', roles: '["affiliate"]', businessName: 'Marketing Pro Agency',
    phone: '+2348067890123', verified: 1, onboardingCompleted: 1
  });

  // Categories
  const categories = [
    { id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets, phones, laptops, and electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
    { id: '2', name: 'Fashion', slug: 'fashion', description: 'Trending clothing, shoes, and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
    { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement, furniture, and garden supplies', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
    { id: '4', name: 'Sports', slug: 'sports', description: 'Sports equipment, fitness gear, and outdoor accessories', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba24e312?w=400' },
    { id: '5', name: 'Books', slug: 'books', description: 'Books, educational materials, and stationery', image: 'https://images.unsplash.com/photo-1495446815901-a714ee44995b?w=400' },
    { id: '6', name: 'Health & Beauty', slug: 'health-beauty', description: 'Skincare, cosmetics, and health products', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400' },
    { id: '7', name: 'Food & Groceries', slug: 'food-groceries', description: 'Fresh groceries, packaged food, and beverages', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
    { id: '8', name: 'Automotive', slug: 'automotive', description: 'Car parts, accessories, and automotive tools', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400' },
  ];
  categories.forEach(c => insert('categories', c));

  // Stores
  const store1 = insert('stores', {
    id: '1', name: 'Ahmad Electronics Store', slug: 'ahmad-electronics',
    description: 'Your one-stop shop for the latest electronics, gadgets, and tech accessories. We offer authentic products with warranty.',
    sellerId: '2', ownerId: '2', isApproved: 1, isActive: 1, isVerified: 1,
    location: 'Lagos, Nigeria', established: '2020',
    phone: '+2348012345678', email: 'ahmad@electronics.com',
    productCount: 8, rating: 4.5, reviewCount: 120, totalSales: 45000,
    businessType: 'Electronics Retail',
    socialMedia: JSON.stringify({ facebook: 'ahmadelectronics', instagram: '@ahmadelectronics' }),
    policies: JSON.stringify({ shipping: 'Free shipping on orders above $50. Standard delivery 3-5 business days.', returns: '30-day return policy for defective items.' }),
    categories: JSON.stringify(['electronics']), tags: JSON.stringify(['electronics', 'gadgets', 'tech'])
  });

  const store2 = insert('stores', {
    id: '2', name: 'Fatima Fashion House', slug: 'fatima-fashion',
    description: 'Premium fashion for men and women. African-inspired designs with modern twists. Handcrafted with love.',
    sellerId: '3', ownerId: '3', isApproved: 1, isActive: 1, isVerified: 1,
    location: 'Abuja, Nigeria', established: '2019',
    phone: '+2348023456789', email: 'fatima@fashion.com',
    productCount: 6, rating: 4.8, reviewCount: 89, totalSales: 32000,
    businessType: 'Fashion Design',
    socialMedia: JSON.stringify({ instagram: '@fatimafashionhouse', twitter: '@fatimafashion' }),
    policies: JSON.stringify({ shipping: 'Free shipping within Nigeria. International shipping available.', returns: '14-day return for unworn items.' }),
    categories: JSON.stringify(['fashion']), tags: JSON.stringify(['fashion', 'african', 'designer'])
  });

  insert('stores', {
    id: '3', name: 'TechMart Nigeria', slug: 'techmart-ng',
    description: 'Authorized dealer of computers, laptops, and networking equipment. Enterprise solutions available.',
    sellerId: '4', ownerId: '4', isApproved: 1, isActive: 1, isVerified: 1,
    location: 'Port Harcourt, Nigeria', established: '2021',
    phone: '+2348034567890', email: 'info@techmart.ng',
    productCount: 5, rating: 4.3, reviewCount: 67, totalSales: 28000,
    businessType: 'IT Solutions',
    categories: JSON.stringify(['electronics']), tags: JSON.stringify(['computers', 'laptops', 'networking'])
  });

  // Products for Store 1 (Electronics)
  const products = [
    { id: '1', name: 'Wireless Bluetooth Earbuds Pro', description: 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX7 waterproof rating. Compatible with all devices.', price: 49.99, originalPrice: 79.99, discount: 37.5, category: 'Electronics', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 150, isFeatured: 1, isActive: 1, rating: 4.7, reviewCount: 234, soldCount: 890, sku: 'WB-EP-001', tags: JSON.stringify(['wireless', 'earbuds', 'bluetooth', 'audio']), images: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 5, affiliateEnabled: 1, affiliateCommission: 10 },
    { id: '2', name: 'Smart Watch Series X', description: 'Advanced smartwatch with health monitoring, GPS tracking, heart rate sensor, and 7-day battery life. Water resistant to 50m.', price: 129.99, originalPrice: 199.99, discount: 35, category: 'Electronics', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 80, isFeatured: 1, isActive: 1, rating: 4.5, reviewCount: 156, soldCount: 420, sku: 'SW-SX-002', tags: JSON.stringify(['smartwatch', 'fitness', 'health']), images: JSON.stringify(['https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 8, affiliateEnabled: 1, affiliateCommission: 8 },
    { id: '3', name: 'Portable Power Bank 20000mAh', description: 'Fast charging power bank with dual USB-C ports, LED display, and airline-approved capacity. Charges 3 devices simultaneously.', price: 34.99, originalPrice: 54.99, discount: 36, category: 'Electronics', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 200, isFeatured: 1, isActive: 1, rating: 4.6, reviewCount: 312, soldCount: 1200, sku: 'PB-20K-003', tags: JSON.stringify(['powerbank', 'charging', 'portable']), images: JSON.stringify(['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 3, affiliateEnabled: 1, affiliateCommission: 12 },
    { id: '4', name: '4K Action Camera Waterproof', description: 'Ultra HD 4K action camera with image stabilization, waterproof to 40m, WiFi connectivity, and 170-degree wide angle lens.', price: 89.99, originalPrice: 149.99, discount: 40, category: 'Electronics', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 60, isFeatured: 0, isActive: 1, rating: 4.4, reviewCount: 89, soldCount: 320, sku: 'AC-4K-004', tags: JSON.stringify(['camera', 'action', '4k', 'waterproof']), images: JSON.stringify(['https://images.unsplash.com/photo-1526170375885-4d8ecf73499f?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 6 },
    { id: '5', name: 'USB-C Hub 7-in-1 Adapter', description: 'Multi-port USB-C hub with HDMI 4K, USB 3.0, SD card reader, and 100W power delivery pass-through.', price: 29.99, originalPrice: 44.99, discount: 33, category: 'Electronics', sellerId: '4', sellerName: 'TechMart Nigeria', storeId: '3', inventory: 120, isFeatured: 0, isActive: 1, rating: 4.3, reviewCount: 67, soldCount: 450, sku: 'HB-7IN1-005', tags: JSON.stringify(['usb-c', 'hub', 'adapter']), images: JSON.stringify(['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 3 },
    { id: '6', name: 'Mechanical Gaming Keyboard RGB', description: 'Full-size mechanical keyboard with Cherry MX switches, per-key RGB lighting, N-key rollover, and detachable wrist rest.', price: 79.99, originalPrice: 119.99, discount: 33, category: 'Electronics', sellerId: '4', sellerName: 'TechMart Nigeria', storeId: '3', inventory: 45, isFeatured: 1, isActive: 1, rating: 4.8, reviewCount: 201, soldCount: 560, sku: 'KB-MEC-006', tags: JSON.stringify(['keyboard', 'gaming', 'mechanical', 'rgb']), images: JSON.stringify(['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 7, affiliateEnabled: 1, affiliateCommission: 8 },
    // Fashion products
    { id: '7', name: 'African Print Ankara Dress', description: 'Beautiful handmade Ankara print dress with modern cut design. Perfect for parties and special occasions. Available in multiple sizes.', price: 59.99, originalPrice: 89.99, discount: 33, category: 'Fashion', sellerId: '3', sellerName: 'Fatima Fashion House', storeId: '2', inventory: 30, isFeatured: 1, isActive: 1, rating: 4.9, reviewCount: 45, soldCount: 180, sku: 'DR-ANK-007', tags: JSON.stringify(['ankara', 'african', 'dress', 'handmade']), images: JSON.stringify(['https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 5, affiliateEnabled: 1, affiliateCommission: 15 },
    { id: '8', name: 'Handwoven Leather Sandals', description: 'Premium handcrafted leather sandals with cushioned sole. Traditional Nigerian craftsmanship meets modern comfort.', price: 39.99, originalPrice: 59.99, discount: 33, category: 'Fashion', sellerId: '3', sellerName: 'Fatima Fashion House', storeId: '2', inventory: 50, isFeatured: 0, isActive: 1, rating: 4.6, reviewCount: 78, soldCount: 290, sku: 'SD-LTH-008', tags: JSON.stringify(['sandals', 'leather', 'handmade']), images: JSON.stringify(['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 4 },
    { id: '9', name: 'Embroidered Agbada Set', description: 'Luxurious 3-piece Agbada set with intricate embroidery. Includes Agbada, inner top, and trousers. Perfect for ceremonies.', price: 149.99, originalPrice: 249.99, discount: 40, category: 'Fashion', sellerId: '3', sellerName: 'Fatima Fashion House', storeId: '2', inventory: 20, isFeatured: 1, isActive: 1, rating: 4.8, reviewCount: 34, soldCount: 95, sku: 'AG-EMB-009', tags: JSON.stringify(['agbada', 'traditional', 'ceremony']), images: JSON.stringify(['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 8, affiliateEnabled: 1, affiliateCommission: 12 },
    { id: '10', name: 'Wireless Charging Pad 15W', description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and anti-slip surface.', price: 19.99, originalPrice: 34.99, discount: 43, category: 'Electronics', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 300, isFeatured: 0, isActive: 1, rating: 4.2, reviewCount: 156, soldCount: 780, sku: 'WC-15W-010', tags: JSON.stringify(['wireless', 'charging', 'qi']), images: JSON.stringify(['https://images.unsplash.com/photo-1591290619762-c1e9275e3a36?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 2, affiliateEnabled: 1, affiliateCommission: 15 },
    { id: '11', name: 'Fitness Yoga Mat Premium', description: 'Extra thick 6mm yoga mat with non-slip surface, carrying strap included. Eco-friendly TPE material.', price: 24.99, originalPrice: 39.99, discount: 37, category: 'Sports', sellerId: '4', sellerName: 'TechMart Nigeria', storeId: '3', inventory: 100, isFeatured: 0, isActive: 1, rating: 4.5, reviewCount: 89, soldCount: 340, sku: 'YM-PRM-011', tags: JSON.stringify(['yoga', 'fitness', 'exercise']), images: JSON.stringify(['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 5 },
    { id: '12', name: 'Organic Shea Butter Cream', description: 'Pure unrefined organic shea butter from Nigeria. Multi-purpose moisturizer for skin and hair. 250ml jar.', price: 14.99, originalPrice: 24.99, discount: 40, category: 'Health & Beauty', sellerId: '3', sellerName: 'Fatima Fashion House', storeId: '2', inventory: 200, isFeatured: 1, isActive: 1, rating: 4.7, reviewCount: 234, soldCount: 890, sku: 'SB-ORG-012', tags: JSON.stringify(['shea butter', 'organic', 'skincare']), images: JSON.stringify(['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 3, affiliateEnabled: 1, affiliateCommission: 20 },
    { id: '13', name: 'Smart Home Speaker with AI', description: 'Voice-controlled smart speaker with premium sound quality, built-in AI assistant, multi-room audio support.', price: 69.99, originalPrice: 99.99, discount: 30, category: 'Electronics', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 75, isFeatured: 1, isActive: 1, rating: 4.4, reviewCount: 123, soldCount: 410, sku: 'SP-AI-013', tags: JSON.stringify(['smart speaker', 'ai', 'voice']), images: JSON.stringify(['https://images.unsplash.com/photo-1543512214-318c7553f230?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 5, affiliateEnabled: 1, affiliateCommission: 10 },
    { id: '14', name: 'Laptop Backpack Anti-Theft', description: 'Anti-theft laptop backpack with USB charging port, waterproof fabric, hidden zippers, and padded laptop compartment for up to 15.6" laptops.', price: 44.99, originalPrice: 69.99, discount: 36, category: 'Fashion', sellerId: '3', sellerName: 'Fatima Fashion House', storeId: '2', inventory: 90, isFeatured: 0, isActive: 1, rating: 4.6, reviewCount: 167, soldCount: 520, sku: 'BP-ANT-014', tags: JSON.stringify(['backpack', 'laptop', 'anti-theft']), images: JSON.stringify(['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 5, affiliateEnabled: 1, affiliateCommission: 10 },
    { id: '15', name: 'Ergonomic Office Chair', description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, breathable mesh back, and 360-degree swivel.', price: 199.99, originalPrice: 349.99, discount: 43, category: 'Home & Garden', sellerId: '4', sellerName: 'TechMart Nigeria', storeId: '3', inventory: 25, isFeatured: 1, isActive: 1, rating: 4.7, reviewCount: 89, soldCount: 150, sku: 'CH-ERG-015', tags: JSON.stringify(['office', 'chair', 'ergonomic']), images: JSON.stringify(['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 15, affiliateEnabled: 1, affiliateCommission: 5 },
    { id: '16', name: 'LED Desk Lamp with Wireless Charger', description: 'Multi-function LED desk lamp with 5 brightness levels, color temperature control, built-in wireless phone charger, and USB port.', price: 39.99, originalPrice: 64.99, discount: 38, category: 'Home & Garden', sellerId: '2', sellerName: 'Ahmad Electronics Store', storeId: '1', inventory: 110, isFeatured: 0, isActive: 1, rating: 4.5, reviewCount: 98, soldCount: 380, sku: 'DL-LED-016', tags: JSON.stringify(['desk lamp', 'led', 'wireless charger']), images: JSON.stringify(['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600']), type: 'simple', shippingEnabled: 1, shippingCost: 5, affiliateEnabled: 1, affiliateCommission: 12 },
  ];
  products.forEach(p => insert('products', p));

  // Languages
  const languages = [
    { id: '1', code: 'en', name: 'English' },
    { id: '2', code: 'fr', name: 'French' },
    { id: '3', code: 'es', name: 'Spanish' },
    { id: '4', code: 'de', name: 'German' },
    { id: '5', code: 'zh', name: 'Chinese' },
    { id: '6', code: 'ar', name: 'Arabic' },
    { id: '7', code: 'hi', name: 'Hindi' },
    { id: '8', code: 'pt', name: 'Portuguese' },
    { id: '9', code: 'ru', name: 'Russian' },
    { id: '10', code: 'ja', name: 'Japanese' },
    { id: '11', code: 'ha', name: 'Hausa' },
    { id: '12', code: 'sw', name: 'Swahili' },
    { id: '13', code: 'tr', name: 'Turkish' },
  ];
  languages.forEach(l => insert('languages', l));

  // Currencies
  const currencies = [
    { id: '1', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1 },
    { id: '2', code: 'NGN', name: 'Nigerian Naira', symbol: '₦', exchangeRate: 1500 },
    { id: '3', code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92 },
    { id: '4', code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79 },
    { id: '5', code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 157.64 },
    { id: '6', code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.25 },
    { id: '7', code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.54 },
    { id: '8', code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.37 },
    { id: '9', code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.51 },
    { id: '10', code: 'ZAR', name: 'South African Rand', symbol: 'R', exchangeRate: 18.78 },
    { id: '11', code: 'BRL', name: 'Brazilian Real', symbol: 'R$', exchangeRate: 5.37 },
    { id: '12', code: 'TRY', name: 'Turkish Lira', symbol: '₺', exchangeRate: 32.5 },
  ];
  currencies.forEach(c => insert('currencies', c));

  // Platform commission
  insert('platform_commissions', {
    id: '1', percentage: 5, isGlobal: 1
  });

  // Seller agreement
  insert('seller_agreements', {
    id: '1', version: 'v1', content: '# Seller Agreement\n\nBy registering as a seller on GoShop, you agree to:\n\n- Platform commission: 5% per sale\n- Deliver products as described\n- Maintain accurate inventory\n- Respond to customer inquiries within 24 hours\n- Honor valid refund requests\n\nThis agreement may be updated from time to time.',
    variables: JSON.stringify({ platform_name: 'GoShop', commission_percentage: '5' }),
    isActive: 1
  });

  // Sample orders
  insert('orders', {
    id: '101', userId: '5', items: JSON.stringify([{ productId: '1', quantity: 2, price: 49.99, name: 'Wireless Bluetooth Earbuds Pro', images: [], sellerId: '2', shippingCost: 5, deliveryMethod: 'shipping', status: 'pending' }]),
    total: 104.98, subtotal: 99.98, shippingTotal: 5, status: 'delivered', paymentStatus: 'completed',
    paymentMethod: 'paystack', shippingAddress: JSON.stringify({ street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria', firstName: 'John', lastName: 'Doe', phone: '+2348045678901' }),
    billingAddress: JSON.stringify({ street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria' }),
    sellerId: '2', transactionRef: 'goshop_101_001', deliveredAt: new Date(Date.now() - 86400000 * 3).toISOString()
  });

  insert('orders', {
    id: '102', userId: '6', items: JSON.stringify([{ productId: '7', quantity: 1, price: 59.99, name: 'African Print Ankara Dress', images: [], sellerId: '3', shippingCost: 5, deliveryMethod: 'shipping', status: 'shipped' }, { productId: '12', quantity: 2, price: 14.99, name: 'Organic Shea Butter Cream', images: [], sellerId: '3', shippingCost: 3, deliveryMethod: 'shipping', status: 'shipped' }]),
    total: 94.97, subtotal: 89.97, shippingTotal: 5, status: 'shipped', paymentStatus: 'completed',
    paymentMethod: 'wallet', shippingAddress: JSON.stringify({ street: '456 Abuja Rd', city: 'Abuja', state: 'FCT', zip: '900001', country: 'Nigeria', firstName: 'Aisha', lastName: 'Mohammed', phone: '+2348056789012' }),
    billingAddress: JSON.stringify({ street: '456 Abuja Rd', city: 'Abuja', state: 'FCT', zip: '900001', country: 'Nigeria' }),
    sellerId: '3', transactionRef: 'goshop_102_002'
  });

  insert('orders', {
    id: '103', userId: '5', items: JSON.stringify([{ productId: '6', quantity: 1, price: 79.99, name: 'Mechanical Gaming Keyboard RGB', images: [], sellerId: '4', shippingCost: 7, deliveryMethod: 'shipping', status: 'processing' }]),
    total: 86.99, subtotal: 79.99, shippingTotal: 7, status: 'processing', paymentStatus: 'completed',
    paymentMethod: 'cod', shippingAddress: JSON.stringify({ street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria', firstName: 'John', lastName: 'Doe', phone: '+2348045678901' }),
    billingAddress: JSON.stringify({ street: '123 Main St', city: 'Lagos', state: 'Lagos', zip: '100001', country: 'Nigeria' }),
    sellerId: '4', transactionRef: 'goshop_103_003'
  });

  // Wallets
  insert('wallets', { id: '1', userId: '5', balance: 250.00 });
  insert('wallets', { id: '2', userId: '6', balance: 100.00 });
  insert('wallets', { id: '3', userId: '2', balance: 5000.00 });
  insert('wallets', { id: '4', userId: '3', balance: 3200.00 });

  // Reviews
  insert('reviews', { id: '1', productId: '1', userId: '5', userName: 'John Doe', rating: 5, title: 'Excellent earbuds!', content: 'Sound quality is amazing and battery lasts forever. Best purchase I have made.', isVerified: 1 });
  insert('reviews', { id: '2', productId: '1', userId: '6', userName: 'Aisha Mohammed', rating: 4, title: 'Good quality', content: 'Works well, comfortable fit. Delivery was fast.', isVerified: 1 });
  insert('reviews', { id: '3', productId: '7', userId: '6', userName: 'Aisha Mohammed', rating: 5, title: 'Beautiful dress!', content: 'The Ankara print is stunning. Got many compliments at the party.', isVerified: 1 });
  insert('reviews', { id: '4', productId: '6', userId: '5', userName: 'John Doe', rating: 5, title: 'Perfect for gaming', content: 'Cherry MX switches feel great. RGB lighting is customizable.', isVerified: 1 });

  // Help articles
  insert('help_articles', { id: '1', title: 'Getting Started with GoShop', content: 'Welcome to GoShop! Create your account, browse products, add items to your cart, and checkout securely. We support multiple payment methods including Paystack, PayPal, Flutterwave, Razorpay, and wallet payments.', category: 'getting-started', slug: 'getting-started', isPublished: 1 });
  insert('help_articles', { id: '2', title: 'How to Become a Seller', content: 'To become a seller on GoShop: 1. Register with seller role, 2. Complete your profile and business information, 3. Accept the seller agreement, 4. Start listing your products. Our team will review and approve your store.', category: 'seller-guide', slug: 'become-a-seller', isPublished: 1 });
  insert('help_articles', { id: '3', title: 'Payment Methods', content: 'GoShop supports: Paystack (cards, bank transfer, USSD), PayPal, Flutterwave, Razorpay, Wallet payments, and Cash on Delivery. All online payments are encrypted and secure.', category: 'payments', slug: 'payment-methods', isPublished: 1 });
  insert('help_articles', { id: '4', title: 'Shipping & Delivery', content: 'Delivery times vary by location. Lagos: 1-2 days. Other states: 3-5 days. International: 7-14 days. Track your order from your dashboard.', category: 'shipping', slug: 'shipping-delivery', isPublished: 1 });

  // Notifications
  insert('notifications', { id: '1', userId: '5', title: 'Welcome to GoShop!', message: 'Thank you for joining GoShop. Start exploring thousands of products from verified sellers.', type: 'success', read: 0 });
  insert('notifications', { id: '2', userId: '5', title: 'Order Delivered', message: 'Your order #101 has been delivered. Please leave a review!', type: 'info', read: 0 });

  console.log('Database seeded successfully!');
  console.log('Test accounts:');
  console.log('  Admin: admin@goshop.com / Admin@123');
  console.log('  Seller: seller1@goshop.com / Seller@123');
  console.log('  Customer: customer@goshop.com / Customer@123');
  console.log('  Affiliate: affiliate@goshop.com / Affiliate@123');
}
