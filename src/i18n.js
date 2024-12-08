import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh/translation.json';
import * as globals from "./globals"

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: translationEN,
      },
      zh: {
        translation: translationZH,
      },
    },
    lng: globals.DEFAULT_LANG, // set the default language
    fallbackLng: globals.FALLBACK_LANG, // use 'en' if a translation is not available in the current language
    interpolation: {
      escapeValue: false, // not needed for React as it escapes by default
    },
  });

export default i18n;