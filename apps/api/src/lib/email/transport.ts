// BismiLLAH Ar-Rahman Ar-Roheem.
// Gmail transport with dual auth:
//   (a) SMTP app password (GMAIL_USER + GMAIL_APP_PASSWORD)  — primary
//   (b) OAuth2 refresh-token flow (GMAIL_OAUTH_CLIENT_ID + SECRET + REFRESH_TOKEN + GMAIL_USER) — fallback
// Auto-detects which is configured via env. Exposes a singleton getTransport().
// If neither is configured, logs a warning and returns null — emails are best-effort;
// the API must still boot and serve requests without Gmail configured.

import nodemailer, { type Transporter } from 'nodemailer';

let cachedTransport: Transporter | null = null;
let cachedAuthMode: 'smtp' | 'oauth2' | 'none' | null = null;

interface AuthConfig {
  mode: 'smtp' | 'oauth2' | 'none';
  user: string;
}

function readAuthConfig(): AuthConfig {
  const user = process.env.GMAIL_USER || '';
  const appPassword = process.env.GMAIL_APP_PASSWORD || '';
  const oauthClientId = process.env.GMAIL_OAUTH_CLIENT_ID || '';
  const oauthClientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET || '';
  const oauthRefreshToken = process.env.GMAIL_OAUTH_REFRESH_TOKEN || '';

  // Primary: SMTP app password.
  if (user && appPassword) {
    return { mode: 'smtp', user };
  }
  // Fallback: OAuth2 refresh-token flow.
  if (user && oauthClientId && oauthClientSecret && oauthRefreshToken) {
    return { mode: 'oauth2', user };
  }
  return { mode: 'none', user };
}

function buildTransporter(cfg: AuthConfig): Transporter | null {
  if (cfg.mode === 'smtp') {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: cfg.user,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      // DKIM-friendly defaults; nodemailer generates a valid Message-ID per message.
      name: process.env.EMAIL_DOMAIN || extractDomain(cfg.user),
    });
  }

  if (cfg.mode === 'oauth2') {
    // nodemailer refreshes the OAuth2 access token automatically when it expires
    // (it caches the token internally and re-requests via the refresh_token).
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: cfg.user,
        clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
      },
      name: process.env.EMAIL_DOMAIN || extractDomain(cfg.user),
    });
  }

  return null;
}

function extractDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : 'goshop.com';
}

/**
 * Returns the singleton configured nodemailer transporter, or null if Gmail is
 * not configured. Never throws — callers must null-check before sending.
 */
export function getTransport(): Transporter | null {
  if (cachedTransport !== null && cachedAuthMode !== null) {
    return cachedTransport;
  }
  const cfg = readAuthConfig();
  if (cfg.mode === 'none') {
    if (cachedAuthMode !== 'none') {
      // Log the warning only once per process lifetime to avoid log spam.
      console.warn(
        '[email] No Gmail transport configured (set GMAIL_USER + GMAIL_APP_PASSWORD, ' +
          'or GMAIL_OAUTH_* vars). Emails will be no-op. The API still works.'
      );
    }
    cachedAuthMode = 'none';
    cachedTransport = null;
    return null;
  }
  try {
    cachedTransport = buildTransporter(cfg);
    cachedAuthMode = cfg.mode;
    console.info(`[email] Gmail transport ready (mode: ${cfg.mode}, user: ${cfg.user}).`);
    return cachedTransport;
  } catch (err: any) {
    console.error('[email] Failed to build Gmail transport:', err?.message || err);
    cachedAuthMode = 'none';
    cachedTransport = null;
    return null;
  }
}

/**
 * Verifies the transporter can connect. Returns { ok, error? }.
 * Safe to call from the test script.
 */
export async function verifyTransport(): Promise<{ ok: boolean; error?: string; mode: string }> {
  const t = getTransport();
  const mode = cachedAuthMode || 'none';
  if (!t) return { ok: false, error: 'No transport configured', mode };
  try {
    await t.verify();
    return { ok: true, mode };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), mode };
  }
}

/** Test-only: resets the cached transport so env changes are picked up. */
export function _resetTransportCache(): void {
  cachedTransport = null;
  cachedAuthMode = null;
}

export function getAuthMode(): 'smtp' | 'oauth2' | 'none' {
  if (cachedAuthMode) return cachedAuthMode;
  return readAuthConfig().mode;
}

export { nodemailer };
