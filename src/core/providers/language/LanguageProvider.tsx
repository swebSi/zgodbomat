import type { LanguageType } from '@shared/i18n/model/localize';
import { LanguageList } from '@shared/i18n/model/localize';
import {
  constantStorage,
  STORAGE_CONSTANT_PREFERRED_LANGUAGE,
} from '@shared/storage/contstant-storage';
import { getLocales, useLocales } from 'expo-localization';
import type { FC, ReactNode } from 'react';
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import i18n from '../../../shared/i18n/i18n';

const deviceLanguage = getLocales()[0]?.languageCode ?? LanguageList.EN;
const defaultLanguage = ['en', 'sl'].includes(deviceLanguage)
  ? (deviceLanguage as LanguageType)
  : LanguageList.EN;

export const LanguageProvider: FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>(defaultLanguage);
  const locales = useLocales();
  const locale = locales[0];

  useLayoutEffect(() => {
    const persistedLanguage = constantStorage.getItem(
      STORAGE_CONSTANT_PREFERRED_LANGUAGE
    ) as LanguageType;

    if (persistedLanguage) {
      setLanguage(persistedLanguage);
    } else if (locale) {
      setLanguage(locale.languageCode as LanguageType);
    }
  }, []);

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
      constantStorage.setItem(STORAGE_CONSTANT_PREFERRED_LANGUAGE, language);
    }
  }, [language]);

  return (
    <LocaleContext.Provider value={{ language, setLanguage }}>{children}</LocaleContext.Provider>
  );
};

// PARTS

export const LocaleContext = createContext<{
  language: string;
  setLanguage: (language: LanguageType) => void;
}>({
  language: defaultLanguage,
  setLanguage: () => {},
});

export function useLocale() {
  const { language, setLanguage } = useContext(LocaleContext);
  return { language, setLanguage };
}

// TYPES

interface LanguageProviderProps {
  children: ReactNode;
}
