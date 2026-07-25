import type { APIContext } from 'astro';
import { jsonResponse, errorResponse } from '../../../lib/auth';

let translateModule: any = null;

async function getTranslate() {
  if (!translateModule) {
    try {
      translateModule = (await import('google-translate-api-x')).default;
    } catch {
      translateModule = null;
    }
  }
  return translateModule;
}

const cache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60;

export async function POST(context: APIContext): Promise<Response> {
  try {
    const { text, targetLang, sourceLang = 'en' } = await context.request.json();

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
