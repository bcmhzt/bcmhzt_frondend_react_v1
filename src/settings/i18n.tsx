import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

/** i18n configuration */
i18n
  .use(HttpBackend) /** Load translation files from external sources */
  .use(LanguageDetector) /** Automatically detect the user's language */
  .use(initReactI18next) /** Integrate i18n with React */
  .init({
    fallbackLng: 'en', /** Default language if detection fails */
    debug: true, /** Enable debug mode for development */
    interpolation: {
      escapeValue: false, /** React does not require escaping */
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', /** Path to the translation files */
    },
  });

export default i18n;
