// BismiLLAH Ar-Rahman Ar-Roheem.
// All 28 GoShop email templates. Each returns { subject, html, text, preheader }.
// Uses the shared layout (layout.ts) + helper primitives. Inline CSS only. NO emojis.
// Subjects avoid spam-trigger words ("FREE", "!!!", all-caps).

import {
  renderLayout,
  button,
  link,
  infoRow,
  divider,
  h1,
  h2,
  p,
  note,
  bullets,
  orderItemsTable,
  formatMoney,
  esc,
  BRAND,
} from './layout';

export interface TemplateRenderInput {
  [key: string]: any;
}

export interface TemplateRenderOutput {
  subject: string;
  html: string;
  text: string;
  preheader?: string;
}

export interface TemplateDef {
  name: string;
  category: 'system' | 'transactional' | 'wallet' | 'seller' | 'referral' | 'admin' | 'support';
  subject: (d: TemplateRenderInput) => string;
  render: (d: TemplateRenderInput) => { html: string; text: string; preheader?: string };
  /** '1' = high, '3' = normal, '5' = low. Maps to X-Priority header. */
  priority?: '1' | '3' | '5';
  /** If true, List-Unsubscribe header is added (marketing/newsletter). */
  marketing?: boolean;
}

function greet(name: unknown): string {
  const n = name ? String(name).trim() : '';
  return n ? `Hi ${esc(n)},` : 'Hi,';
}
function greetText(name: unknown): string {
  const n = name ? String(name).trim() : '';
  return n ? `Hi ${n},` : 'Hi,';
}

function textLines(...lines: string[]): string {
  return lines.filter((l) => l !== undefined && l !== null).join('\n');
}

// ----------------------------------------------------------------------------
// SYSTEM / AUTH
// ----------------------------------------------------------------------------

const welcome: TemplateDef = {
  name: 'welcome',
  category: 'system',
  subject: (d) => `Welcome to GoShop, ${d.name || 'there'}`,
  render: (d) => {
    const role = String(d.role || 'customer');
    const roleLabel = role === 'seller' ? 'seller' : role === 'affiliate' ? 'affiliate' : 'customer';
    const html = `
      ${h1('Welcome to GoShop')}
      ${p(greet(d.name) + ' Your GoShop account is ready.')}
      ${p(
        `You joined as a <strong style="color:${BRAND.greenDark};">${esc(roleLabel)}</strong>. Whether you are shopping for great deals or building your store, GoShop gives you the tools to succeed in one marketplace.`
      )}
      ${h2('Get started')}
      ${bullets([
        'Browse products and discover verified stores',
        role === 'seller'
          ? 'Set up your store and list your first product'
          : 'Save items to your wishlist and track orders in real time',
        'Earn rewards by inviting friends with your referral link',
      ])}
      ${button(d.dashboardLink || safeAppUrl('/dashboard'), 'Open your dashboard')}
      ${note('If you did not create this account, you can safely ignore this email.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Your GoShop account is ready.',
      `You joined as a ${roleLabel}.`,
      '',
      'Get started:',
      '- Browse products and discover verified stores',
      role === 'seller'
        ? '- Set up your store and list your first product'
        : '- Save items to your wishlist and track orders in real time',
      '- Earn rewards by inviting friends with your referral link',
      '',
      `Open your dashboard: ${d.dashboardLink || safeAppUrl('/dashboard')}`,
      '',
      'If you did not create this account, you can safely ignore this email.'
    );
    return {
      html,
      text,
      preheader: 'Your GoShop account is ready. Start shopping and earning today.',
    };
  },
  priority: '3',
};

const passwordReset: TemplateDef = {
  name: 'passwordReset',
  category: 'system',
  subject: () => 'Reset your GoShop password',
  render: (d) => {
    const html = `
      ${h1('Reset your password')}
      ${p(greet(d.name) + ' We received a request to reset the password for your GoShop account.')}
      ${p('Click the button below to choose a new password. This link is valid for 30 minutes.')}
      ${button(d.resetLink || safeAppUrl('/reset-password'), 'Reset password')}
      ${p(`If the button does not work, copy and paste this link into your browser: <br /><span style="word-break:break-all;font-size:13px;color:${BRAND.grayText};">${esc(d.resetLink || safeAppUrl('/reset-password'))}</span>`)}
      ${note('If you did not request a password reset, you can ignore this email and your password will stay the same.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'We received a request to reset the password for your GoShop account.',
      'Click the link below to choose a new password. This link is valid for 30 minutes.',
      '',
      `Reset password: ${d.resetLink || safeAppUrl('/reset-password')}`,
      '',
      'If you did not request a password reset, you can ignore this email and your password will stay the same.'
    );
    return { html, text, preheader: 'Reset your GoShop password. Link valid for 30 minutes.' };
  },
  priority: '1',
};

const loginAlert: TemplateDef = {
  name: 'loginAlert',
  category: 'system',
  subject: () => 'New login to your GoShop account',
  render: (d) => {
    const html = `
      ${h1('New login detected')}
      ${p(greet(d.name) + ' We noticed a new sign-in to your GoShop account.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 18px 0;">
        ${infoRow('Time', String(d.time || new Date().toISOString()))}
        ${infoRow('IP address', String(d.ip || 'Unknown'))}
        ${infoRow('Device', String(d.device || 'Unknown'))}
      </table>
      ${p('If this was you, no action is needed. If you do not recognize this activity, please change your password immediately.')}
      ${button(safeAppUrl('/settings/security'), 'Review security')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'We noticed a new sign-in to your GoShop account.',
      '',
      `Time: ${d.time || new Date().toISOString()}`,
      `IP address: ${d.ip || 'Unknown'}`,
      `Device: ${d.device || 'Unknown'}`,
      '',
      'If this was you, no action is needed. If you do not recognize this activity, please change your password immediately.',
      '',
      `Review security: ${safeAppUrl('/settings/security')}`
    );
    return { html, text, preheader: 'A new device signed in to your GoShop account.' };
  },
  priority: '3',
};

// ----------------------------------------------------------------------------
// TRANSACTIONAL / ORDERS
// ----------------------------------------------------------------------------

const orderConfirmation: TemplateDef = {
  name: 'orderConfirmation',
  category: 'transactional',
  subject: (d) => `Order confirmed - #${shortId(d.orderId)}`,
  render: (d) => {
    const items = Array.isArray(d.items) ? d.items : [];
    const html = `
      ${h1('Thank you for your order')}
      ${p(greet(d.name) + ' Your order has been confirmed. We are getting it ready for shipment.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Estimated delivery', String(d.estimatedDelivery || '3-7 business days'))}
            ${infoRow('Total paid', formatMoney(d.total, d.currency))}
          </table>
        </td></tr>
      </table>
      ${h2('Order summary')}
      ${orderItemsTable(items)}
      ${divider()}
      ${d.trackingLink ? button(d.trackingLink, 'Track your order') : ''}
      ${note('A shipping confirmation with tracking will follow once your order ships.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Your order has been confirmed. We are getting it ready for shipment.',
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Estimated delivery: ${d.estimatedDelivery || '3-7 business days'}`,
      `Total paid: ${formatMoney(d.total, d.currency)}`,
      '',
      'Order summary:',
      ...items.map((it: any) => `- ${it.name || 'Item'} x ${it.quantity || 1}: ${formatMoney((it.total !== undefined ? it.total : (it.quantity || 0) * (it.price || 0)), d.currency)}`),
      '',
      d.trackingLink ? `Track your order: ${d.trackingLink}` : '',
      'A shipping confirmation with tracking will follow once your order ships.'
    );
    return { html, text, preheader: `Order #${shortId(d.orderId)} confirmed. We are preparing it for shipment.` };
  },
  priority: '1',
};

const orderStatusUpdate: TemplateDef = {
  name: 'orderStatusUpdate',
  category: 'transactional',
  subject: (d) => `Order #${shortId(d.orderId)} - ${titleCase(String(d.newStatus || 'updated'))}`,
  render: (d) => {
    const html = `
      ${h1('Order status update')}
      ${p(greet(d.name) + ` The status of your order <strong>#${shortId(d.orderId)}</strong> has been updated.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('New status', titleCase(String(d.newStatus || 'updated')))}
          </table>
        </td></tr>
      </table>
      ${d.message ? p(esc(d.message)) : ''}
      ${d.trackingLink ? button(d.trackingLink, 'View order') : ''}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `The status of your order #${shortId(d.orderId)} has been updated.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `New status: ${titleCase(String(d.newStatus || 'updated'))}`,
      d.message ? `\n${d.message}` : '',
      '',
      d.trackingLink ? `View order: ${d.trackingLink}` : ''
    );
    return { html, text, preheader: `Order #${shortId(d.orderId)} is now ${titleCase(String(d.newStatus || 'updated'))}.` };
  },
  priority: '3',
};

const orderShipped: TemplateDef = {
  name: 'orderShipped',
  category: 'transactional',
  subject: (d) => `Your order #${shortId(d.orderId)} has shipped`,
  render: (d) => {
    const html = `
      ${h1('Your order is on the way')}
      ${p(greet(d.name) + ` Good news - your order <strong>#${shortId(d.orderId)}</strong> has shipped.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Carrier', String(d.carrier || 'Shipping partner'))}
            ${infoRow('Tracking number', String(d.trackingNumber || '-'))}
          </table>
        </td></tr>
      </table>
      ${d.trackingLink ? button(d.trackingLink, 'Track shipment') : ''}
      ${note('Delivery typically takes 3-7 business days depending on your location.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `Good news - your order #${shortId(d.orderId)} has shipped.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Carrier: ${d.carrier || 'Shipping partner'}`,
      `Tracking number: ${d.trackingNumber || '-'}`,
      '',
      d.trackingLink ? `Track shipment: ${d.trackingLink}` : '',
      'Delivery typically takes 3-7 business days depending on your location.'
    );
    return { html, text, preheader: `Order #${shortId(d.orderId)} shipped. Track your package.` };
  },
  priority: '1',
};

const orderDelivered: TemplateDef = {
  name: 'orderDelivered',
  category: 'transactional',
  subject: (d) => `Order #${shortId(d.orderId)} delivered`,
  render: (d) => {
    const html = `
      ${h1('Your order has been delivered')}
      ${p(greet(d.name) + ` Your order <strong>#${shortId(d.orderId)}</strong> has been delivered. We hope you love your purchase!`)}
      ${p('Your feedback helps other shoppers and supports our sellers. Would you take a moment to share a review?')}
      ${d.reviewLink ? button(d.reviewLink, 'Write a review') : ''}
      ${note('If something is not right with your order, you can open a return or dispute from your order page.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `Your order #${shortId(d.orderId)} has been delivered. We hope you love your purchase!`,
      'Your feedback helps other shoppers and supports our sellers. Would you take a moment to share a review?',
      '',
      d.reviewLink ? `Write a review: ${d.reviewLink}` : '',
      'If something is not right with your order, you can open a return or dispute from your order page.'
    );
    return { html, text, preheader: `Order #${shortId(d.orderId)} delivered. Share your review.` };
  },
  priority: '3',
};

const newOrder: TemplateDef = {
  name: 'newOrder',
  category: 'transactional',
  subject: (d) => `New order received - #${shortId(d.orderId)}`,
  render: (d) => {
    const items = Array.isArray(d.items) ? d.items : [];
    const html = `
      ${h1('You have a new order')}
      ${p(`<strong>${esc(d.customerName || 'A customer')}</strong> just placed an order from your store.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Customer', String(d.customerName || '-'))}
            ${infoRow('Order total', formatMoney(d.total, d.currency))}
          </table>
        </td></tr>
      </table>
      ${h2('Items')}
      ${orderItemsTable(items)}
      ${divider()}
      ${d.dashboardLink ? button(d.dashboardLink, 'View order in dashboard') : ''}
      ${note('Please prepare the order for shipment and update the status once dispatched.')}
    `;
    const text = textLines(
      'You have a new order.',
      '',
      `${d.customerName || 'A customer'} just placed an order from your store.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Customer: ${d.customerName || '-'}`,
      `Order total: ${formatMoney(d.total, d.currency)}`,
      '',
      'Items:',
      ...items.map((it: any) => `- ${it.name || 'Item'} x ${it.quantity || 1}: ${formatMoney((it.total !== undefined ? it.total : (it.quantity || 0) * (it.price || 0)), d.currency)}`),
      '',
      d.dashboardLink ? `View order in dashboard: ${d.dashboardLink}` : '',
      'Please prepare the order for shipment and update the status once dispatched.'
    );
    return { html, text, preheader: `New order #${shortId(d.orderId)} from ${d.customerName || 'a customer'}.` };
  },
  priority: '1',
};

const paymentSuccess: TemplateDef = {
  name: 'paymentSuccess',
  category: 'transactional',
  subject: (d) => `Payment received for order #${shortId(d.orderId)}`,
  render: (d) => {
    const html = `
      ${h1('Payment confirmed')}
      ${p(greet(d.name) + ` We received your payment for order <strong>#${shortId(d.orderId)}</strong>.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Amount paid', formatMoney(d.amount, d.currency))}
            ${infoRow('Payment method', titleCase(String(d.paymentMethod || 'Online')))}
          </table>
        </td></tr>
      </table>
      ${d.receiptLink ? button(d.receiptLink, 'View receipt') : ''}
      ${note('A receipt has been attached to your order. You can download it anytime from your order history.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `We received your payment for order #${shortId(d.orderId)}.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Amount paid: ${formatMoney(d.amount, d.currency)}`,
      `Payment method: ${titleCase(String(d.paymentMethod || 'Online'))}`,
      '',
      d.receiptLink ? `View receipt: ${d.receiptLink}` : '',
      'A receipt has been attached to your order. You can download it anytime from your order history.'
    );
    return { html, text, preheader: `Payment received for order #${shortId(d.orderId)}.` };
  },
  priority: '1',
};

const paymentFailed: TemplateDef = {
  name: 'paymentFailed',
  category: 'transactional',
  subject: (d) => `Payment failed for order #${shortId(d.orderId)}`,
  render: (d) => {
    const html = `
      ${h1('Payment could not be processed')}
      ${p(greet(d.name) + ` We could not process the payment for order <strong>#${shortId(d.orderId)}</strong>.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6E6;border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Amount', formatMoney(d.amount, d.currency))}
            ${infoRow('Reason', String(d.reason || 'Your bank declined the transaction.'))}
          </table>
        </td></tr>
      </table>
      ${p('No charges have been made. Please try again with a different payment method.')}
      ${d.retryLink ? button(d.retryLink, 'Retry payment') : ''}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `We could not process the payment for order #${shortId(d.orderId)}.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Amount: ${formatMoney(d.amount, d.currency)}`,
      `Reason: ${d.reason || 'Your bank declined the transaction.'}`,
      '',
      'No charges have been made. Please try again with a different payment method.',
      '',
      d.retryLink ? `Retry payment: ${d.retryLink}` : ''
    );
    return { html, text, preheader: `Payment failed for order #${shortId(d.orderId)}. Please retry.` };
  },
  priority: '1',
};

const refundProcessed: TemplateDef = {
  name: 'refundProcessed',
  category: 'transactional',
  subject: (d) => `Refund processed for order #${shortId(d.orderId)}`,
  render: (d) => {
    const html = `
      ${h1('Your refund has been processed')}
      ${p(greet(d.name) + ` A refund for order <strong>#${shortId(d.orderId)}</strong> has been processed.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Refund amount', formatMoney(d.refundAmount, d.currency))}
            ${infoRow('Refund method', titleCase(String(d.method || 'Original payment method')))}
            ${infoRow('Time to reflect', String(d.daysToReflect || '5-10 business days'))}
          </table>
        </td></tr>
      </table>
      ${note('The refund may take several business days to appear in your account depending on your bank.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `A refund for order #${shortId(d.orderId)} has been processed.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Refund amount: ${formatMoney(d.refundAmount, d.currency)}`,
      `Refund method: ${titleCase(String(d.method || 'Original payment method'))}`,
      `Time to reflect: ${d.daysToReflect || '5-10 business days'}`,
      '',
      'The refund may take several business days to appear in your account depending on your bank.'
    );
    return { html, text, preheader: `Refund processed for order #${shortId(d.orderId)}.` };
  },
  priority: '3',
};

// ----------------------------------------------------------------------------
// WALLET / PAYOUTS
// ----------------------------------------------------------------------------

const walletCredited: TemplateDef = {
  name: 'walletCredited',
  category: 'wallet',
  subject: () => 'Your GoShop wallet was credited',
  render: (d) => {
    const html = `
      ${h1('Wallet credited')}
      ${p(greet(d.name) + ' Your GoShop wallet balance has been updated.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Amount credited', `+ ${formatMoney(d.amount, d.currency)}`)}
            ${infoRow('New balance', formatMoney(d.balance, d.currency))}
            ${infoRow('Description', String(d.description || 'Wallet credit'))}
          </table>
        </td></tr>
      </table>
      ${button(safeAppUrl('/wallet'), 'View wallet')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Your GoShop wallet balance has been updated.',
      '',
      `Amount credited: + ${formatMoney(d.amount, d.currency)}`,
      `New balance: ${formatMoney(d.balance, d.currency)}`,
      `Description: ${d.description || 'Wallet credit'}`,
      '',
      `View wallet: ${safeAppUrl('/wallet')}`
    );
    return { html, text, preheader: 'Your wallet was credited. View the updated balance.' };
  },
  priority: '3',
};

const walletDebited: TemplateDef = {
  name: 'walletDebited',
  category: 'wallet',
  subject: () => 'Your GoShop wallet was debited',
  render: (d) => {
    const html = `
      ${h1('Wallet debited')}
      ${p(greet(d.name) + ' Your GoShop wallet balance has been updated.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Amount debited', `- ${formatMoney(d.amount, d.currency)}`)}
            ${infoRow('New balance', formatMoney(d.balance, d.currency))}
            ${infoRow('Description', String(d.description || 'Wallet debit'))}
          </table>
        </td></tr>
      </table>
      ${button(safeAppUrl('/wallet'), 'View wallet')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Your GoShop wallet balance has been updated.',
      '',
      `Amount debited: - ${formatMoney(d.amount, d.currency)}`,
      `New balance: ${formatMoney(d.balance, d.currency)}`,
      `Description: ${d.description || 'Wallet debit'}`,
      '',
      `View wallet: ${safeAppUrl('/wallet')}`
    );
    return { html, text, preheader: 'Your wallet was debited. View the updated balance.' };
  },
  priority: '3',
};

const withdrawalRequested: TemplateDef = {
  name: 'withdrawalRequested',
  category: 'wallet',
  subject: (d) => `Withdrawal request received - ${formatMoney(d.amount)}`,
  render: (d) => {
    const html = `
      ${h1('Withdrawal request received')}
      ${p(greet(d.name) + ' We received your withdrawal request and it is now pending review.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Amount', formatMoney(d.amount, d.currency))}
            ${infoRow('Method', titleCase(String(d.method || 'Bank transfer')))}
            ${infoRow('Estimated processing', String(d.eta || '2-5 business days'))}
          </table>
        </td></tr>
      </table>
      ${note('You will receive an email once your withdrawal is approved and processed.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'We received your withdrawal request and it is now pending review.',
      '',
      `Amount: ${formatMoney(d.amount, d.currency)}`,
      `Method: ${titleCase(String(d.method || 'Bank transfer'))}`,
      `Estimated processing: ${d.eta || '2-5 business days'}`,
      '',
      'You will receive an email once your withdrawal is approved and processed.'
    );
    return { html, text, preheader: 'Your withdrawal request is pending review.' };
  },
  priority: '3',
};

const withdrawalApproved: TemplateDef = {
  name: 'withdrawalApproved',
  category: 'wallet',
  subject: (d) => `Withdrawal approved - ${formatMoney(d.amount)}`,
  render: (d) => {
    const html = `
      ${h1('Withdrawal approved')}
      ${p(greet(d.name) + ' Your withdrawal request has been approved and processed.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Amount', formatMoney(d.amount, d.currency))}
            ${infoRow('Method', titleCase(String(d.method || 'Bank transfer')))}
            ${infoRow('Processed at', String(d.processedAt || new Date().toISOString()))}
          </table>
        </td></tr>
      </table>
      ${note('Please allow a few business days for the funds to reflect in your account.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Your withdrawal request has been approved and processed.',
      '',
      `Amount: ${formatMoney(d.amount, d.currency)}`,
      `Method: ${titleCase(String(d.method || 'Bank transfer'))}`,
      `Processed at: ${d.processedAt || new Date().toISOString()}`,
      '',
      'Please allow a few business days for the funds to reflect in your account.'
    );
    return { html, text, preheader: 'Your withdrawal has been approved and processed.' };
  },
  priority: '3',
};

const withdrawalRejected: TemplateDef = {
  name: 'withdrawalRejected',
  category: 'wallet',
  subject: (d) => `Withdrawal update - ${formatMoney(d.amount)}`,
  render: (d) => {
    const html = `
      ${h1('Withdrawal update')}
      ${p(greet(d.name) + ' We were unable to process your withdrawal request at this time.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6E6;border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Amount', formatMoney(d.amount, d.currency))}
            ${infoRow('Status', 'Rejected')}
          </table>
        </td></tr>
      </table>
      ${d.reason ? p(`<strong>Reason:</strong> ${esc(d.reason)}`) : ''}
      ${p('If you believe this is an error, please contact our support team.')}
      ${button(safeAppUrl('/wallet'), 'Go to wallet')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'We were unable to process your withdrawal request at this time.',
      '',
      `Amount: ${formatMoney(d.amount, d.currency)}`,
      'Status: Rejected',
      d.reason ? `\nReason: ${d.reason}` : '',
      '',
      'If you believe this is an error, please contact our support team.',
      '',
      `Go to wallet: ${safeAppUrl('/wallet')}`
    );
    return { html, text, preheader: 'Your withdrawal request could not be processed.' };
  },
  priority: '3',
};

// ----------------------------------------------------------------------------
// SELLER / STORE
// ----------------------------------------------------------------------------

const storeApproved: TemplateDef = {
  name: 'storeApproved',
  category: 'seller',
  subject: (d) => `Your store ${d.storeName || ''} is approved`,
  render: (d) => {
    const html = `
      ${h1('Your store is live')}
      ${p(greet(d.name) + ` Congratulations! Your store <strong>${esc(d.storeName)}</strong> has been approved and is now live on GoShop.`)}
      ${p('You can start listing products, manage orders, and grow your business on the marketplace.')}
      ${button(d.dashboardLink || safeAppUrl('/seller/dashboard'), 'Open seller dashboard')}
      ${note('Review the seller agreement and commission structure in your dashboard settings.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `Congratulations! Your store ${d.storeName || ''} has been approved and is now live on GoShop.`,
      'You can start listing products, manage orders, and grow your business on the marketplace.',
      '',
      `Open seller dashboard: ${d.dashboardLink || safeAppUrl('/seller/dashboard')}`,
      '',
      'Review the seller agreement and commission structure in your dashboard settings.'
    );
    return { html, text, preheader: 'Your GoShop store is approved and live.' };
  },
  priority: '3',
};

const storeRejected: TemplateDef = {
  name: 'storeRejected',
  category: 'seller',
  subject: (d) => `Update on your store ${d.storeName || ''} application`,
  render: (d) => {
    const html = `
      ${h1('Store application update')}
      ${p(greet(d.name) + ` We were unable to approve your store <strong>${esc(d.storeName)}</strong> at this time.`)}
      ${d.reason ? p(`<strong>Reason:</strong> ${esc(d.reason)}`) : ''}
      ${p('You can address the issues above and submit a new application. If you have questions, our support team is happy to help.')}
      ${button(safeAppUrl('/seller/onboarding'), 'Reapply')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `We were unable to approve your store ${d.storeName || ''} at this time.`,
      d.reason ? `\nReason: ${d.reason}` : '',
      '',
      'You can address the issues above and submit a new application. If you have questions, our support team is happy to help.',
      '',
      `Reapply: ${safeAppUrl('/seller/onboarding')}`
    );
    return { html, text, preheader: 'An update on your GoShop store application.' };
  },
  priority: '3',
};

const lowStockAlert: TemplateDef = {
  name: 'lowStockAlert',
  category: 'seller',
  subject: (d) => `Low stock alert - ${d.productName || 'your product'}`,
  render: (d) => {
    const html = `
      ${h1('Low stock alert')}
      ${p(greet(d.name) + ' One of your products is running low on inventory.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6E6;border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Product', String(d.productName || '-'))}
            ${infoRow('Current stock', String(d.currentStock ?? 0))}
            ${infoRow('Low stock threshold', String(d.threshold ?? 5))}
          </table>
        </td></tr>
      </table>
      ${p('Restock soon to avoid losing sales. Customers cannot purchase out-of-stock items.')}
      ${d.dashboardLink ? button(d.dashboardLink, 'Manage inventory') : ''}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'One of your products is running low on inventory.',
      '',
      `Product: ${d.productName || '-'}`,
      `Current stock: ${d.currentStock ?? 0}`,
      `Low stock threshold: ${d.threshold ?? 5}`,
      '',
      'Restock soon to avoid losing sales. Customers cannot purchase out-of-stock items.',
      '',
      d.dashboardLink ? `Manage inventory: ${d.dashboardLink}` : ''
    );
    return { html, text, preheader: `${d.productName || 'A product'} is running low on stock.` };
  },
  priority: '3',
};

const sellerAgreement: TemplateDef = {
  name: 'sellerAgreement',
  category: 'seller',
  subject: () => 'Your GoShop seller agreement',
  render: (d) => {
    const agreementText = String(d.agreementContent || 'The GoShop seller agreement terms will be shown here.');
    const html = `
      ${h1('Your seller agreement')}
      ${p(greet(d.name) + ' Welcome to the GoShop seller community. Please review the agreement below.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Commission rate', `${Number(d.commissionRate || 0)}%`)}
          </table>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7FAF8;border:1px solid ${BRAND.grayBorder};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:16px;font-size:13px;line-height:1.65;color:${BRAND.dark};white-space:pre-wrap;">${esc(agreementText)}</td></tr>
      </table>
      ${note('By continuing to use the seller dashboard, you acknowledge that you have read and accepted this agreement.')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Welcome to the GoShop seller community. Please review the agreement below.',
      '',
      `Commission rate: ${Number(d.commissionRate || 0)}%`,
      '',
      '--- Agreement ---',
      agreementText,
      '--- End agreement ---',
      '',
      'By continuing to use the seller dashboard, you acknowledge that you have read and accepted this agreement.'
    );
    return { html, text, preheader: 'Review your GoShop seller agreement and commission rate.' };
  },
  priority: '3',
};

// ----------------------------------------------------------------------------
// REFERRAL / ENGAGEMENT
// ----------------------------------------------------------------------------

const referralInvite: TemplateDef = {
  name: 'referralInvite',
  category: 'referral',
  subject: (d) => `${d.inviterName || 'Your friend'} invited you to GoShop`,
  render: (d) => {
    const html = `
      ${h1('You are invited to GoShop')}
      ${p(`<strong>${esc(d.inviterName || 'Your friend')}</strong> thinks you will love GoShop - the marketplace for great products from verified sellers.`)}
      ${d.rewardDescription ? p(`<span style="display:inline-block;background-color:${BRAND.lightBg};color:${BRAND.greenDark};font-weight:700;padding:8px 14px;border-radius:8px;font-size:14px;">${esc(d.rewardDescription)}</span>`) : ''}
      ${button(d.referralLink || safeAppUrl('/'), 'Join GoShop')}
      ${note('By joining, you agree to the GoShop terms of service and privacy policy.')}
    `;
    const text = textLines(
      `You are invited to GoShop.`,
      '',
      `${d.inviterName || 'Your friend'} thinks you will love GoShop - the marketplace for great products from verified sellers.`,
      d.rewardDescription ? `\nReward: ${d.rewardDescription}` : '',
      '',
      `Join GoShop: ${d.referralLink || safeAppUrl('/')}`,
      '',
      'By joining, you agree to the GoShop terms of service and privacy policy.'
    );
    return { html, text, preheader: `${d.inviterName || 'A friend'} invited you to join GoShop.` };
  },
  priority: '3',
  marketing: true,
};

const referralSignup: TemplateDef = {
  name: 'referralSignup',
  category: 'referral',
  subject: (d) => `${d.newUserName || 'Someone'} joined with your referral`,
  render: (d) => {
    const html = `
      ${h1('You have a new referral')}
      ${p(greet(d.name) + ` <strong>${esc(d.newUserName || 'A new user')}</strong> just signed up on GoShop using your referral link.`)}
      ${d.rewardEarned ? p(`You earned <strong style="color:${BRAND.greenDark};">${esc(d.rewardEarned)}</strong>. Keep sharing your link to earn more.`) : p('Keep sharing your link to earn rewards.')}
      ${button(d.dashboardLink || safeAppUrl('/dashboard?tab=referrals'), 'View referrals')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      `${d.newUserName || 'A new user'} just signed up on GoShop using your referral link.`,
      d.rewardEarned ? `You earned ${d.rewardEarned}. Keep sharing your link to earn more.` : 'Keep sharing your link to earn rewards.',
      '',
      `View referrals: ${d.dashboardLink || safeAppUrl('/dashboard?tab=referrals')}`
    );
    return { html, text, preheader: 'A new referral signed up using your link.' };
  },
  priority: '3',
};

const referralReward: TemplateDef = {
  name: 'referralReward',
  category: 'referral',
  subject: (d) => `Referral commission earned - ${formatMoney(d.commissionEarned)}`,
  render: (d) => {
    const html = `
      ${h1('Referral commission earned')}
      ${p(greet(d.name) + ' Your referral made a qualifying purchase and you earned a commission.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order amount', formatMoney(d.orderAmount, d.currency))}
            ${infoRow('Your commission', formatMoney(d.commissionEarned, d.currency))}
          </table>
        </td></tr>
      </table>
      ${button(d.dashboardLink || safeAppUrl('/dashboard?tab=referrals'), 'View earnings')}
    `;
    const text = textLines(
      greetText(d.name),
      '',
      'Your referral made a qualifying purchase and you earned a commission.',
      '',
      `Order amount: ${formatMoney(d.orderAmount, d.currency)}`,
      `Your commission: ${formatMoney(d.commissionEarned, d.currency)}`,
      '',
      `View earnings: ${d.dashboardLink || safeAppUrl('/dashboard?tab=referrals')}`
    );
    return { html, text, preheader: 'You earned a referral commission.' };
  },
  priority: '3',
};

// ----------------------------------------------------------------------------
// ADMIN / PLATFORM
// ----------------------------------------------------------------------------

const storeApprovalRequest: TemplateDef = {
  name: 'storeApprovalRequest',
  category: 'admin',
  subject: (d) => `New store pending approval - ${d.storeName || ''}`,
  render: (d) => {
    const html = `
      ${h1('New store pending approval')}
      ${p('A new store application requires review.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Store name', String(d.storeName || '-'))}
            ${infoRow('Seller', String(d.sellerName || '-'))}
          </table>
        </td></tr>
      </table>
      ${d.reviewLink ? button(d.reviewLink, 'Review store') : ''}
    `;
    const text = textLines(
      'New store pending approval.',
      '',
      'A new store application requires review.',
      '',
      `Store name: ${d.storeName || '-'}`,
      `Seller: ${d.sellerName || '-'}`,
      '',
      d.reviewLink ? `Review store: ${d.reviewLink}` : ''
    );
    return { html, text, preheader: 'A new store application requires admin review.' };
  },
  priority: '3',
};

const withdrawalRequest: TemplateDef = {
  name: 'withdrawalRequest',
  category: 'admin',
  subject: (d) => `Withdrawal request - ${formatMoney(d.amount)} from ${d.userName || ''}`,
  render: (d) => {
    const html = `
      ${h1('Withdrawal request received')}
      ${p('A user has requested a withdrawal. Please review and process it.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('User', String(d.userName || '-'))}
            ${infoRow('Amount', formatMoney(d.amount, d.currency))}
            ${infoRow('Method', titleCase(String(d.method || 'Bank transfer')))}
          </table>
        </td></tr>
      </table>
      ${d.reviewLink ? button(d.reviewLink, 'Review request') : ''}
    `;
    const text = textLines(
      'Withdrawal request received.',
      '',
      'A user has requested a withdrawal. Please review and process it.',
      '',
      `User: ${d.userName || '-'}`,
      `Amount: ${formatMoney(d.amount, d.currency)}`,
      `Method: ${titleCase(String(d.method || 'Bank transfer'))}`,
      '',
      d.reviewLink ? `Review request: ${d.reviewLink}` : ''
    );
    return { html, text, preheader: 'A withdrawal request requires admin review.' };
  },
  priority: '3',
};

const disputeOpened: TemplateDef = {
  name: 'disputeOpened',
  category: 'admin',
  subject: (d) => `Dispute opened on order #${shortId(d.orderId)}`,
  render: (d) => {
    const html = `
      ${h1('A dispute has been opened')}
      ${p(`A dispute has been opened on order <strong>#${shortId(d.orderId)}</strong>.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6E6;border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Order number', `#${shortId(d.orderId)}`)}
            ${infoRow('Customer', String(d.customerName || '-'))}
            ${infoRow('Reason', String(d.reason || '-'))}
          </table>
        </td></tr>
      </table>
      ${p('Please review the dispute details and respond promptly to resolve the issue.')}
      ${d.dashboardLink ? button(d.dashboardLink, 'View dispute') : ''}
    `;
    const text = textLines(
      'A dispute has been opened.',
      '',
      `A dispute has been opened on order #${shortId(d.orderId)}.`,
      '',
      `Order number: #${shortId(d.orderId)}`,
      `Customer: ${d.customerName || '-'}`,
      `Reason: ${d.reason || '-'}`,
      '',
      'Please review the dispute details and respond promptly to resolve the issue.',
      '',
      d.dashboardLink ? `View dispute: ${d.dashboardLink}` : ''
    );
    return { html, text, preheader: `Dispute opened on order #${shortId(d.orderId)}.` };
  },
  priority: '1',
};

// ----------------------------------------------------------------------------
// SUPPORT / NOTIFICATIONS
// ----------------------------------------------------------------------------

const contactForm: TemplateDef = {
  name: 'contactForm',
  category: 'support',
  subject: (d) => `Contact form: ${d.name || 'Anonymous'}`,
  render: (d) => {
    const html = `
      ${h1('New contact form submission')}
      ${p('A visitor submitted the contact form.')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};border-radius:10px;margin:8px 0 18px 0;">
        <tr><td style="padding:14px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${infoRow('Name', String(d.name || '-'))}
            ${infoRow('Email', String(d.email || '-'))}
          </table>
        </td></tr>
      </table>
      ${h2('Message')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7FAF8;border:1px solid ${BRAND.grayBorder};border-radius:10px;">
        <tr><td style="padding:16px;font-size:14px;line-height:1.65;color:${BRAND.dark};white-space:pre-wrap;">${esc(String(d.message || ''))}</td></tr>
      </table>
      ${p(`Reply directly to this email or contact them at ${link('mailto:' + encodeURIComponent(String(d.email || '')), String(d.email || ''))}.`)}
    `;
    const text = textLines(
      'New contact form submission.',
      '',
      'A visitor submitted the contact form.',
      '',
      `Name: ${d.name || '-'}`,
      `Email: ${d.email || '-'}`,
      '',
      'Message:',
      String(d.message || ''),
      '',
      `Reply: ${d.email ? 'mailto:' + d.email : '-'}`
    );
    return { html, text, preheader: 'New message from the GoShop contact form.' };
  },
  priority: '3',
};

const newsletterWelcome: TemplateDef = {
  name: 'newsletterWelcome',
  category: 'support',
  subject: () => 'Welcome to the GoShop newsletter',
  render: (d) => {
    const html = `
      ${h1('You are subscribed')}
      ${p(`Thank you for subscribing to the GoShop newsletter. From now on, you will receive curated deals, new arrivals, and seller stories.`)}
      ${h2('What to expect')}
      ${bullets([
        'Weekly highlights of trending products',
        'Exclusive subscriber-only deals',
        'Tips for selling and shopping on GoShop',
      ])}
      ${button(safeAppUrl('/'), 'Explore GoShop')}
      ${note(`You can ${link(d.unsubscribeLink || safeAppUrl('/unsubscribe'), 'unsubscribe at any time')}.`)}
    `;
    const text = textLines(
      'You are subscribed.',
      '',
      'Thank you for subscribing to the GoShop newsletter. From now on, you will receive curated deals, new arrivals, and seller stories.',
      '',
      'What to expect:',
      '- Weekly highlights of trending products',
      '- Exclusive subscriber-only deals',
      '- Tips for selling and shopping on GoShop',
      '',
      `Explore GoShop: ${safeAppUrl('/')}`,
      '',
      `You can unsubscribe at any time: ${d.unsubscribeLink || safeAppUrl('/unsubscribe')}`
    );
    return { html, text, preheader: 'Welcome to the GoShop newsletter.' };
  },
  priority: '3',
  marketing: true,
};

// ----------------------------------------------------------------------------
// REGISTRY
// ----------------------------------------------------------------------------

export const TEMPLATES: Record<string, TemplateDef> = {
  // system / auth
  welcome,
  passwordReset,
  loginAlert,
  // transactional / orders
  orderConfirmation,
  orderStatusUpdate,
  orderShipped,
  orderDelivered,
  newOrder,
  paymentSuccess,
  paymentFailed,
  refundProcessed,
  // wallet / payouts
  walletCredited,
  walletDebited,
  withdrawalRequested,
  withdrawalApproved,
  withdrawalRejected,
  // seller / store
  storeApproved,
  storeRejected,
  lowStockAlert,
  sellerAgreement,
  // referral / engagement
  referralInvite,
  referralSignup,
  referralReward,
  // admin / platform
  storeApprovalRequest,
  withdrawalRequest,
  disputeOpened,
  // support / notifications
  contactForm,
  newsletterWelcome,
};

export function listTemplateNames(): string[] {
  return Object.keys(TEMPLATES).sort();
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function safeAppUrl(path: string): string {
  const base = process.env.APP_URL || '';
  if (!base) return path;
  return base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

function shortId(id: unknown): string {
  const s = String(id || '');
  if (!s) return 'unknown';
  return s.length > 10 ? s.slice(0, 8).toUpperCase() : s.toUpperCase();
}

function titleCase(s: string): string {
  if (!s) return '';
  return s
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Render a template by name with the given data. Returns null if not found. */
export function renderTemplateByName(
  name: string,
  data: TemplateRenderInput
): TemplateRenderOutput | null {
  const def = TEMPLATES[name];
  if (!def) return null;
  const subject = def.subject(data || {});
  const rendered = def.render(data || {});
  const layout = renderLayout({
    subject,
    preheader: rendered.preheader,
    contentHtml: rendered.html,
    contentText: rendered.text,
    unsubscribeLink: data?.unsubscribeLink,
  });
  return {
    subject,
    html: layout.html,
    text: layout.text,
    preheader: rendered.preheader,
  };
}

export function getTemplateDef(name: string): TemplateDef | undefined {
  return TEMPLATES[name];
}
