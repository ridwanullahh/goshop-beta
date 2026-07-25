const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export class TranslationService {
  private cache: Map<string, Map<string, string>> = new Map();
  private supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
    { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  ];

  private rtlLanguages = ['ar', 'he', 'fa', 'ur'];

  isRTL(lang?: string): boolean {
    return this.rtlLanguages.includes(lang || 'en');
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  async translateText(text: string, targetLang: string, sourceLang = 'en'): Promise<string> {
    if (sourceLang === targetLang || !text?.trim()) return text;

    const cacheKey = `${sourceLang}-${targetLang}`;
    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, new Map());
    }
    const langCache = this.cache.get(cacheKey)!;
    if (langCache.has(text)) return langCache.get(text)!;

    try {
      const response = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang })
      });

      if (!response.ok) return text;
      const data = await response.json();
      const translation = data.translatedText || text;
      langCache.set(text, translation);
      return translation;
    } catch {
      return text;
    }
  }

  getCurrentLanguage(): string {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved) return saved;
    const browserLang = navigator.language.split('-')[0];
    const codes = this.supportedLanguages.map(l => l.code);
    return codes.includes(browserLang) ? browserLang : 'en';
  }

  setLanguage(lang: string): void {
    localStorage.setItem('preferredLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = this.isRTL(lang) ? 'rtl' : 'ltr';
    window.location.reload();
  }

  formatNumber(num: number, lang?: string): string {
    return new Intl.NumberFormat(lang || this.getCurrentLanguage()).format(num);
  }

  formatDate(date: Date | string, lang?: string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(lang || this.getCurrentLanguage(), {
      year: 'numeric', month: 'long', day: 'numeric', ...options
    }).format(dateObj);
  }

  formatCurrency(amount: number, currency = 'USD', lang?: string): string {
    return new Intl.NumberFormat(lang || this.getCurrentLanguage(), {
      style: 'currency', currency
    }).format(amount);
  }
}

export const translationService = new TranslationService();
