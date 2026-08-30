// BismiLLAH Ar-Rahman Ar-Roheem.
// BirrPay webhook receiver for GoShop.
// Verifies X-BirrPay-Signature (t=…,v1=… HMAC-SHA256 over "{t}.{rawBody}"
// against BIRRPAY_WEBHOOK_SECRET), then marks the matching order paid when
// BirrPay reports payment.succeeded. Idempotent: already-paid orders are
// skipped; unknown references ACK 200 so BirrPay does not retry forever.
import { jsonResponse, getById, update } from '../lib/auth';
import { getEnv } from '../lib/env';

async function verifySignature(rawBody: string, sigHeader: string | null): Promise<boolean> {
  const secret = getEnv('BIRRPAY_WEBHOOK_SECRET');
  if (!secret || !sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=') as [string, string]));
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false; // replay guard
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

export async function birrpayWebhookHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return errorResponse('Method Not Allowed', 405);
  const rawBody = await request.text();
  if (!(await verifySignature(rawBody, request.headers.get('x-birrpay-signature')))) {
    return errorResponse('Invalid signature', 401);
  }

  let body: { event?: string; data?: { reference?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const reference = body.data?.reference ?? '';
  if (body.event === 'payment.succeeded' && reference) {
    // Our references carry the order id: goshop_<orderId>_<ts>
    const orderId = reference.split('_')[1];
    if (orderId) {
      const order = await getById<any>('orders', orderId);
      if (order && order.paymentStatus !== 'completed') {
        await update('orders', orderId, {
          status: 'confirmed',
          paymentStatus: 'completed',
          transactionRef: reference,
        });
      }
    }
  }

  return jsonResponse({ success: true, received: true });
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
