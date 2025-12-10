import { getLocales } from 'expo-localization';
import i18n, { type LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sl from './locales/sl.json';
import { LanguageList } from './model/localize';

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: (callback) => {
    try {
      const locales = getLocales();
      const languageCode = locales[0]?.languageCode || LanguageList.EN;

      callback(languageCode);
    } catch (error) {
      console.error('Error detecting language:', error);
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    fallbackLng: LanguageList.EN,
    defaultNS: 'translations',
    resources: {
      en: { translations: en },
      sl: { translations: sl },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
