import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // load translations using http
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass the i18n instance to react-i18next
  .init({
    supportedLngs: ['en', 'fr', 'es', 'de', 'zh', 'ar', 'hi', 'pt', 'ru', 'ja', 'bn', 'pa', 'jv'],
    fallbackLng: 'en',
    debug: true,
    // Options for language detector
    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'subdomain'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
