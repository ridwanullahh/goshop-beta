// BismiLLAH Ar-Rahman Ar-Roheem.
// Platform-agnostic translate handler. Mirrors src/pages/api/translate/index.ts.
// google-translate-api-x is dynamically imported with try-catch — on Cloudflare
// Workers (where the package's TCP/HTTP deps are unavailable) the import fails
// gracefully and the handler returns the original text (no-op), matching the
// Astro behaviour when the package is not installed.

import { jsonResponse, errorResponse } from '../lib/auth';

let translateModule: any = null;
let translateTried = false;

async function getTranslate(): Promise<any> {
  if (translateTried) return translateModule;
  translateTried = true;
  try {
    translateModule = (await import('google-translate-api-x')).default;
  } catch {
    translateModule = null;
  }
  return translateModule;
}

const cache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60;

export async function translateHandler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }
  try {
    const { text, targetLang, sourceLang = 'en' } = await request.json();

    if (!text || !targetLang) {
      return errorResponse('Text and targetLang are required', 400);
    }

    if (sourceLang === targetLang) {
      return jsonResponse({ translatedText: text });
    }

    const cacheKey = `${sourceLang}-${targetLang}-${text.substring(0, 100)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return jsonResponse({ translatedText: cached.text });
    }

    const translate = await getTranslate();
    if (!translate) {
      return jsonResponse({ translatedText: text, error: 'Translation service unavailable' });
    }

    try {
      const result = await translate(text, { from: sourceLang, to: targetLang });
      cache.set(cacheKey, { text: result.text, timestamp: Date.now() });
      return jsonResponse({ translatedText: result.text, sourceLang: result.from?.language?.iso });
    } catch (translateError) {
      console.error('Translation error:', translateError);
      return jsonResponse({ translatedText: text, error: 'Translation failed' });
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Invalid request', 400);
  }
}
