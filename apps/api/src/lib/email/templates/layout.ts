// BismiLLAH Ar-Rahman Ar-Roheem.
// Reusable branded email layout. Inline CSS only (email clients ignore stylesheets).
// Brand colors: green #05B34D, gold #F2B91C, dark #181F25, light bg #E9FBF1, white #FFFFFF.
// Responsive (max 600px). NO emojis. Text logo "GoShop" with optional image via APP_LOGO_URL.

export interface LayoutInput {
  subject: string;
  preheader?: string;
  contentHtml: string;
  contentText: string;
  unsubscribeLink?: string;
  year?: number;
}

export interface LayoutOutput {
  html: string;
  text: string;
}

const BRAND = {
  green: '#05B34D',
  greenDark: '#04993F',
  gold: '#F2B91C',
  dark: '#181F25',
  lightBg: '#E9FBF1',
  white: '#FFFFFF',
  grayText: '#5B6770',
  grayBorder: '#E3E8EC',
};

/** HTML-escape a value for safe interpolation into markup. */
export function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function logoBlock(): string {
  const logoUrl = process.env.APP_LOGO_URL || '';
  if (logoUrl) {
    return `<img src="${esc(logoUrl)}" alt="GoShop" width="140" height="40" style="display:block;max-width:140px;height:auto;border:0;outline:none;" />`;
  }
  // Text logo: "Go" in white, "Shop" in gold — sits on the green-to-gold banner.
  return `<span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#FFFFFF;">Go<span style="color:${BRAND.gold};">Shop</span></span>`;
}

function footerText(year: number): string {
  const appName = process.env.EMAIL_FROM_NAME || 'GoShop';
  const address = process.env.COMPANY_ADDRESS || 'GoShop Inc., 123 Marketplace Ave, Suite 100, San Francisco, CA 94103, USA';
  return `${appName} | ${address}`;
}

export function renderLayout(input: LayoutInput): LayoutOutput {
  const year = input.year || new Date().getFullYear();
  const preheader = input.preheader || '';
  const unsubscribe = input.unsubscribeLink || `${process.env.APP_URL || ''}/unsubscribe`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${esc(input.subject)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.lightBg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.lightBg};opacity:0;">
    ${esc(preheader)}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.lightBg};">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Email container (max 600px) -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(24,31,37,0.06);">

          <!-- Header / brand banner -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenDark} 55%, ${BRAND.gold} 130%);background-color:${BRAND.green};">
                <tr>
                  <td align="left" style="padding:22px 28px;">
                    ${logoBlock()}
                  </td>
                  <td align="right" valign="middle" style="padding:22px 28px;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;opacity:0.85;">Marketplace</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content card -->
          <tr>
            <td style="padding:36px 32px 28px 32px;background-color:${BRAND.white};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${BRAND.dark};">
                    ${input.contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0;background-color:${BRAND.dark};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 10px 0;font-size:13px;line-height:1.55;color:#C7D0D6;">
                      ${esc(footerText(year))}
                    </p>
                    <p style="margin:0 0 14px 0;font-size:12px;line-height:1.5;color:#8A969E;">
                      You received this email because you have an account with ${esc(process.env.EMAIL_FROM_NAME || 'GoShop')}.
                      If you no longer wish to receive these emails, you can
                      <a href="${esc(unsubscribe)}" style="color:${BRAND.gold};text-decoration:underline;">unsubscribe here</a>.
                    </p>
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#8A969E;">
                      &copy; ${year} ${esc(process.env.EMAIL_FROM_NAME || 'GoShop')}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Email container -->

      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text version: subject + preheader + body text + standard footer.
  const text = `${input.subject}

${preheader ? preheader + '\n\n' : ''}${input.contentText.trim()}

---

${footerText(year)}

You received this email because you have an account with ${process.env.EMAIL_FROM_NAME || 'GoShop'}.
Unsubscribe: ${unsubscribe}

(c) ${year} ${process.env.EMAIL_FROM_NAME || 'GoShop'}. All rights reserved.`;

  return { html, text };
}

/** Shared button markup (green, rounded). */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px 0;">
    <tr>
      <td align="center" style="border-radius:10px;background-color:${BRAND.green};">
        <a href="${esc(href)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px;background-color:${BRAND.green};border:1px solid ${BRAND.green};">${esc(label)}</a>
      </td>
    </tr>
  </table>`;
}

/** Secondary / outline link styled as text link with arrow. */
export function link(href: string, label: string): string {
  return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" style="color:${BRAND.greenDark};font-weight:600;text-decoration:underline;">${esc(label)}</a>`;
}

/** Info row (label: value) used in order summaries, etc. */
export function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:${BRAND.grayText};font-family:Arial,Helvetica,sans-serif;">${esc(label)}</td>
    <td align="right" style="padding:8px 0;font-size:14px;font-weight:600;color:${BRAND.dark};font-family:Arial,Helvetica,sans-serif;">${esc(value)}</td>
  </tr>`;
}

/** Section divider. */
export function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr><td style="border-top:1px solid ${BRAND.grayBorder};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

/** Heading (H1-style) inside the content card. */
export function h1(text: string): string {
  return `<h1 style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;line-height:1.3;color:${BRAND.dark};">${esc(text)}</h1>`;
}

/** Sub-heading (H2-style). */
export function h2(text: string): string {
  return `<h2 style="margin:22px 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:1.35;color:${BRAND.dark};">${esc(text)}</h2>`;
}

/** Paragraph. */
export function p(text: string): string {
  return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:${BRAND.dark};">${text}</p>`;
}

/** Small muted note. */
export function note(text: string): string {
  return `<p style="margin:14px 0 0 0;font-size:12px;line-height:1.55;color:${BRAND.grayText};">${text}</p>`;
}

/** Bullet list. */
export function bullets(items: string[]): string {
  const rows = items
    .map(
      (it) =>
        `<tr><td valign="top" style="padding:4px 8px 4px 0;color:${BRAND.green};font-weight:700;">&bull;</td><td style="padding:4px 0;font-size:14px;line-height:1.6;color:${BRAND.dark};">${it}</td></tr>`
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

/** Order items table. */
export function orderItemsTable(items: Array<{ name?: string; quantity?: number; price?: number; total?: number }>): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  const rows = items
    .map((it) => {
      const qty = Number(it.quantity || 0);
      const price = Number(it.price || 0);
      const total = it.total !== undefined ? Number(it.total) : qty * price;
      return `<tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.dark};font-family:Arial,Helvetica,sans-serif;">${esc(it.name || 'Item')} <span style="color:${BRAND.grayText};">x ${qty}</span></td>
        <td align="right" style="padding:8px 0;font-size:14px;font-weight:600;color:${BRAND.dark};font-family:Arial,Helvetica,sans-serif;">${esc(formatMoney(total))}</td>
      </tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

/** Format a money amount. Accepts number or string. */
export function formatMoney(amount: unknown, currency = 'USD'): string {
  const n = typeof amount === 'number' ? amount : parseFloat(String(amount || '0'));
  if (!isFinite(n)) return '0.00';
  const symbol =
    currency === 'USD' ? '$' :
    currency === 'EUR' ? '\u20AC' :
    currency === 'GBP' ? '\u00A3' :
    currency === 'INR' ? '\u20B9' :
    currency === 'NGN' ? '\u20A6' :
    '';
  return `${symbol}${n.toFixed(2)}`;
}

export { BRAND };
