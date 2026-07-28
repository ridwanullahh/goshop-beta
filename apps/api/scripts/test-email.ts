// BismiLLAH Ar-Rahman Ar-Roheem.
// Test script: sends a test email for every template to TEST_EMAIL_TO.
// Run with:  npm run test:email   (from apps/api)  or  npm run test:email  (from root)
//
// Loads .env from apps/api/.env automatically. If Gmail is not configured, it
// prints a no-op message for each template and exits 0 (the app must boot fine
// without Gmail configured).
//
// Usage:
//   TEST_EMAIL_TO=you@example.com npm run test:email
//   TEST_EMAIL_TO=you@example.com ONLY=welcome,orderConfirmation npm run test:email

import { sendEmail, listTemplateNames, verifyTransport, getAuthMode } from '../src/lib/email/index';

// Load .env manually (the script runs outside Astro's env loader).
async function loadEnv() {
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch (e) {
    // ignore
  }
}

const SAMPLE_DATA: Record<string, any> = {
  welcome: { name: 'Aisha', role: 'customer', dashboardLink: 'https://goshop.com/dashboard' },
  passwordReset: { name: 'Aisha', token: 'tok_abc123', resetLink: 'https://goshop.com/reset-password?token=tok_abc123' },
  loginAlert: { name: 'Aisha', ip: '102.89.23.10', device: 'Chrome on Windows', time: new Date().toISOString() },
  orderConfirmation: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 49.99 },
      { name: 'USB-C Cable', quantity: 2, price: 7.5 },
    ],
    total: 64.99,
    estimatedDelivery: 'Nov 12 - Nov 15',
    trackingLink: 'https://goshop.com/order/ord_7f3a9c2d',
  },
  orderStatusUpdate: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    newStatus: 'shipped',
    trackingLink: 'https://goshop.com/order/ord_7f3a9c2d',
    message: 'Your order has been shipped.',
  },
  orderShipped: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    trackingNumber: 'TRK1234567890',
    carrier: 'DHL Express',
    trackingLink: 'https://goshop.com/track/TRK1234567890',
  },
  orderDelivered: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    reviewLink: 'https://goshop.com/order/ord_7f3a9c2d?review=1',
  },
  newOrder: {
    orderId: 'ord_7f3a9c2d',
    customerName: 'Aisha Bello',
    items: [{ name: 'Wireless Headphones', quantity: 1, price: 49.99 }],
    total: 49.99,
    dashboardLink: 'https://goshop.com/seller/dashboard',
  },
  paymentSuccess: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    amount: 64.99,
    paymentMethod: 'wallet',
    receiptLink: 'https://goshop.com/order/ord_7f3a9c2d?receipt=1',
  },
  paymentFailed: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    amount: 64.99,
    reason: 'Card declined by issuer',
    retryLink: 'https://goshop.com/checkout',
  },
  refundProcessed: {
    name: 'Aisha',
    orderId: 'ord_7f3a9c2d',
    refundAmount: 49.99,
    method: 'Original payment method',
    daysToReflect: '5-10 business days',
  },
  walletCredited: {
    name: 'Aisha',
    amount: 25.0,
    balance: 125.0,
    description: 'Referral reward',
  },
  walletDebited: {
    name: 'Aisha',
    amount: 64.99,
    balance: 60.01,
    description: 'Payment for Order #ord_7f3a9c2d',
  },
  withdrawalRequested: {
    name: 'Aisha',
    amount: 100.0,
    method: 'Bank transfer',
    eta: '2-5 business days',
  },
  withdrawalApproved: {
    name: 'Aisha',
    amount: 100.0,
    method: 'Bank transfer',
    processedAt: new Date().toISOString(),
  },
  withdrawalRejected: {
    name: 'Aisha',
    amount: 100.0,
    reason: 'Bank details could not be verified',
  },
  storeApproved: {
    name: 'Kwame',
    storeName: 'Kwame Crafts',
    dashboardLink: 'https://goshop.com/seller/dashboard',
  },
  storeRejected: {
    name: 'Kwame',
    storeName: 'Kwame Crafts',
    reason: 'Business registration document was not legible',
  },
  lowStockAlert: {
    name: 'Kwame',
    productName: 'Handwoven Basket',
    currentStock: 2,
    threshold: 5,
    dashboardLink: 'https://goshop.com/seller/dashboard/products',
  },
  sellerAgreement: {
    name: 'Kwame',
    commissionRate: 5,
    agreementContent:
      'As a GoShop seller, you agree to: (1) list only authentic products, ' +
      '(2) ship orders within the stated handling time, (3) honor refunds per our return policy, ' +
      '(4) pay the platform commission on each completed sale, and (5) maintain honest communication with buyers.',
  },
  referralInvite: {
    inviterName: 'Aisha',
    referralLink: 'https://goshop.com/?ref=AISHA2024',
    rewardDescription: 'Get $5 off your first order',
  },
  referralSignup: {
    name: 'Aisha',
    newUserName: 'Kwame',
    rewardEarned: '$5 wallet credit',
    dashboardLink: 'https://goshop.com/dashboard?tab=referrals',
  },
  referralReward: {
    name: 'Aisha',
    orderAmount: 120.0,
    commissionEarned: 6.0,
    dashboardLink: 'https://goshop.com/dashboard?tab=referrals',
  },
  storeApprovalRequest: {
    storeName: 'Kwame Crafts',
    sellerName: 'Kwame Mensah',
    reviewLink: 'https://goshop.com/admin/stores/pending',
  },
  withdrawalRequest: {
    userName: 'Aisha Bello',
    amount: 100.0,
    method: 'Bank transfer',
    reviewLink: 'https://goshop.com/admin/withdrawals/pending',
  },
  disputeOpened: {
    orderId: 'ord_7f3a9c2d',
    customerName: 'Aisha Bello',
    reason: 'Item arrived damaged',
    dashboardLink: 'https://goshop.com/admin/disputes',
  },
  contactForm: {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, I have a question about my recent order. When will it arrive?',
  },
  newsletterWelcome: {
    email: 'subscriber@example.com',
    unsubscribeLink: 'https://goshop.com/unsubscribe?email=subscriber@example.com',
  },
};

async function main() {
  await loadEnv();

  const to = process.env.TEST_EMAIL_TO;
  if (!to) {
    console.error('\n[test-email] TEST_EMAIL_TO env var is required.');
    console.error('Usage: TEST_EMAIL_TO=you@example.com npm run test:email\n');
    process.exit(1);
  }

  console.log('\n========================================');
  console.log(' GoShop email template test');
  console.log('========================================');
  console.log(` Recipient: ${to}`);

  const mode = getAuthMode();
  console.log(` Transport mode: ${mode}`);

  if (mode === 'none') {
    console.log('\n[test-email] No Gmail transport configured. Verifying transport...\n');
    const v = await verifyTransport();
    console.log(' verifyTransport:', v);
    console.log('\n[test-email] To actually send emails:');
    console.log('  1. Set GMAIL_USER + GMAIL_APP_PASSWORD (SMTP app password), OR');
    console.log('  2. Set GMAIL_OAUTH_CLIENT_ID + GMAIL_OAUTH_CLIENT_SECRET + GMAIL_OAUTH_REFRESH_TOKEN + GMAIL_USER');
    console.log('  in apps/api/.env, then re-run this script.\n');
    console.log('[test-email] Will still iterate templates and call sendEmail (no-op) to confirm no crashes...\n');
  } else {
    console.log('\n Verifying transport connection...');
    const v = await verifyTransport();
    if (!v.ok) {
      console.error(`  FAILED: ${v.error}`);
      console.error('\n[test-email] Transport verification failed. Check your Gmail credentials.\n');
      process.exit(2);
    }
    console.log('  OK\n');
  }

  const only = process.env.ONLY ? process.env.ONLY.split(',').map((s) => s.trim()).filter(Boolean) : null;
  const names = listTemplateNames().filter((n) => (only ? only.includes(n) : true));

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const name of names) {
    const data = SAMPLE_DATA[name] || {};
    const result = await sendEmail({ to, template: name, data });
    const tag = result.success ? 'OK' : result.skipped ? 'SKIP' : 'FAIL';
    console.log(`  [${tag}] ${name}${result.messageId ? '  messageId=' + result.messageId : ''}${result.error ? '  err=' + result.error : ''}`);
    if (result.success) sent++;
    else if (result.skipped) skipped++;
    else failed++;
  }

  console.log('\n----------------------------------------');
  console.log(` Sent: ${sent}   Failed: ${failed}   Skipped (no transport): ${skipped}`);
  console.log('----------------------------------------\n');

  process.exit(failed > 0 ? 3 : 0);
}

main().catch((err) => {
  console.error('[test-email] uncaught error:', err);
  process.exit(1);
});
