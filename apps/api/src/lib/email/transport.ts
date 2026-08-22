// BismiLLAH Ar-Rahman Ar-Roheem.
// Gmail email transport — nodemailer-free for the OAuth2 path.
//
// Two auth modes (auto-detected via env):
//   (a) OAuth2 refresh token (GMAIL_OAUTH_CLIENT_ID + SECRET + REFRESH_TOKEN + GMAIL_USER)
//       → Gmail REST API via fetch (https://gmail.googleapis.com). Works on BOTH Node and
//         Cloudflare Workers. NO nodemailer dependency. This is the primary/recommended mode.
//   (b) SMTP app password (GMAIL_USER + GMAIL_APP_PASSWORD)
//       → nodemailer SMTP (Node only — requires TCP sockets, NOT available on Workers).
//         Used as a fallback when OAuth2 vars are not set.
//
// If neither is configured, getTransport() returns null — emails are best-effort; the API
// must still boot and serve requests without Gmail configured.

import { getEnv, isWorkersRuntime } from '../env';

export interface MailOptions {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  encoding?: string;
}

export interface SendResult {
  messageId: string;
}

export interface Transport {
  sendMail(options: MailOptions): Promise<SendResult>;
  verify?(): Promise<void>;
}

let cachedTransport: Transport | null = null;
let cachedAuthMode: 'gmail-api' | 'smtp' | 'none' | null = null;
let cachedTransportPromise: Promise<Transport | null> | null = null;

// OAuth2 access token cache.
let cachedAccessToken: string | null = null;
let cachedTokenExpiry = 0;

interface AuthConfig {
  mode: 'gmail-api' | 'smtp' | 'none';
  user: string;
}

function readAuthConfig(): AuthConfig {
  const user = getEnv('GMAIL_USER') || '';
  const oauthClientId = getEnv('GMAIL_OAUTH_CLIENT_ID') || '';
  const oauthClientSecret = getEnv('GMAIL_OAUTH_CLIENT_SECRET') || '';
  const oauthRefreshToken = getEnv('GMAIL_OAUTH_REFRESH_TOKEN') || '';

  // Primary: OAuth2 refresh token → Gmail REST API (works everywhere, no nodemailer).
  if (user && oauthClientId && oauthClientSecret && oauthRefreshToken) {
    return { mode: 'gmail-api', user };
  }

  // Fallback: SMTP app password → nodemailer (Node only).
  const appPassword = getEnv('GMAIL_APP_PASSWORD') || '';
  if (user && appPassword && !isWorkersRuntime()) {
    return { mode: 'smtp', user };
  }

  return { mode: 'none', user };
}

// ---- Gmail REST API transport (OAuth2, fetch-based, Workers-compatible) ----

function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildMimeMessage(options: MailOptions): string {
  const lines: string[] = [];
  const headers = options.headers || {};

  // Required headers.
  lines.push(`From: ${options.from}`);
  lines.push(`To: ${options.to}`);
  if (options.cc) lines.push(`Cc: ${options.cc}`);
  if (options.bcc) lines.push(`Bcc: ${options.bcc}`);
  if (options.replyTo) lines.push(`Reply-To: ${options.replyTo}`);
  lines.push(`Subject: =?utf-8?B?${base64UrlEncode(options.subject)}?=`);
  lines.push('MIME-Version: 1.0');

  // Custom headers (X-Priority, List-Unsubscribe, etc.).
  for (const [key, value] of Object.entries(headers)) {
    lines.push(`${key}: ${value}`);
  }

  // Message-ID (Gmail requires one for good deliverability).
  const msgId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@${getEnv('EMAIL_DOMAIN') || 'goshop.com'}>`;
  lines.push(`Message-ID: ${msgId}`);

  // Multipart/alternative if both text + html are present.
  const hasText = options.text && options.text.trim();
  const hasHtml = options.html && options.html.trim();

  if (hasText && hasHtml) {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    lines.push('');
    lines.push(`--${boundary}`);
    lines.push('Content-Type: text/plain; charset=utf-8');
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('');
    lines.push(base64UrlEncode(options.text!));
    lines.push(`--${boundary}`);
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('');
    lines.push(base64UrlEncode(options.html!));
    lines.push(`--${boundary}--`);
  } else if (hasHtml) {
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('');
    lines.push(base64UrlEncode(options.html!));
  } else {
    lines.push('Content-Type: text/plain; charset=utf-8');
    lines.push('Content-Transfer-Encoding: base64');
    lines.push('');
    lines.push(base64UrlEncode(options.text || ''));
  }

  return lines.join('\r\n');
}

async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s buffer).
  const now = Date.now();
  if (cachedAccessToken && cachedTokenExpiry > now + 60000) {
    return cachedAccessToken;
  }

  const clientId = getEnv('GMAIL_OAUTH_CLIENT_ID');
  const clientSecret = getEnv('GMAIL_OAUTH_CLIENT_SECRET');
  const refreshToken = getEnv('GMAIL_OAUTH_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[email] OAuth2 token refresh failed:', res.status, errText);
    return null;
  }

  const data: any = await res.json();
  cachedAccessToken = data.access_token;
  cachedTokenExpiry = now + (data.expires_in || 3600) * 1000;
  return cachedAccessToken;
}

class GmailApiTransport implements Transport {
  async sendMail(options: MailOptions): Promise<SendResult> {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Could not obtain Gmail OAuth2 access token.');

    const mimeMessage = buildMimeMessage(options);
    const raw = base64UrlEncode(mimeMessage);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      // If token expired, clear cache and retry once.
      if (res.status === 401) {
        cachedAccessToken = null;
        cachedTokenExpiry = 0;
        const newToken = await getAccessToken();
        if (newToken) {
          const retryRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw }),
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            return { messageId: data.id };
          }
        }
      }
      throw new Error(`Gmail API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return { messageId: data.id };
  }

  async verify(): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Could not obtain access token.');
  }
}

// ---- SMTP transport (nodemailer, Node only) ----

async function createSmtpTransport(user: string): Promise<Transport | null> {
  try {
    // Dynamic import with variable specifier prevents static bundling on Workers.
    const specifier = 'nodemailer';
    const mod: any = await import(/* @vite-ignore */ specifier);
    const nodemailer = mod?.default || mod;
    if (!nodemailer?.createTransport) return null;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass: getEnv('GMAIL_APP_PASSWORD'),
      },
      name: getEnv('EMAIL_DOMAIN') || user.split('@')[1] || 'goshop.com',
    });

    return {
      sendMail: (opts: MailOptions) =>
        transporter.sendMail({
          ...opts,
          headers: opts.headers,
        }),
      verify: () => transporter.verify(),
    };
  } catch (err: any) {
    console.warn('[email] nodemailer could not be loaded (SMTP fallback unavailable):', err?.message || err);
    return null;
  }
}

// ---- Public API ----

export function getTransport(): Promise<Transport | null> {
  if (cachedTransportPromise) return cachedTransportPromise;
  cachedTransportPromise = (async () => {
    if (cachedTransport && cachedAuthMode !== null) {
      return cachedTransport;
    }
    const cfg = readAuthConfig();
    if (cfg.mode === 'none') {
      if (cachedAuthMode !== 'none') {
        console.warn(
          '[email] No Gmail transport configured (set GMAIL_OAUTH_* for API mode, or GMAIL_APP_PASSWORD for SMTP). Emails will be no-op. The API still works.'
        );
      }
      cachedAuthMode = 'none';
      cachedTransport = null;
      return null;
    }
    try {
      if (cfg.mode === 'gmail-api') {
        cachedTransport = new GmailApiTransport();
        cachedAuthMode = 'gmail-api';
        console.info(`[email] Gmail API transport ready (OAuth2, user: ${cfg.user}).`);
      } else {
        const smtp = await createSmtpTransport(cfg.user);
        if (smtp) {
          cachedTransport = smtp;
          cachedAuthMode = 'smtp';
          console.info(`[email] SMTP transport ready (nodemailer, user: ${cfg.user}).`);
        } else {
          cachedAuthMode = 'none';
          cachedTransport = null;
        }
      }
      return cachedTransport;
    } catch (err: any) {
      console.error('[email] Failed to build Gmail transport:', err?.message || err);
      cachedAuthMode = 'none';
      cachedTransport = null;
      return null;
    }
  })();
  return cachedTransportPromise;
}

export async function verifyTransport(): Promise<{ ok: boolean; error?: string; mode: string }> {
  const t = await getTransport();
  const mode = cachedAuthMode || 'none';
  if (!t) return { ok: false, error: 'No transport configured', mode };
  try {
    await t.verify?.();
    return { ok: true, mode };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), mode };
  }
}

export function _resetTransportCache(): void {
  cachedTransport = null;
  cachedAuthMode = null;
  cachedTransportPromise = null;
  cachedAccessToken = null;
  cachedTokenExpiry = 0;
}

export function getAuthMode(): 'gmail-api' | 'smtp' | 'none' {
  if (cachedAuthMode) return cachedAuthMode;
  return readAuthConfig().mode;
}
