import React, { useEffect } from 'react';
import { translationService } from '@/lib/i18n/translation-service';

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const currentLang = translationService.getCurrentLanguage();
    const isRTL = translationService.isRTL(currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, []);

  return <>{children}</>;
}
