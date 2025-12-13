import { useLingui } from '@lingui/react';

export const useTranslation = (group?: string) => {
  const { i18n } = useLingui();

  const t = (key: string, values?: Record<string, any>) => {
    const fullKey = group ? `${group}.${key}` : key;
    // Use i18n._ with message ID
    return i18n._(fullKey, values);
  };

  const hasTranslation = (key: string) => {
    const fullKey = group ? `${group}.${key}` : key;
    const translated = i18n._(fullKey);
    // If translation is missing, i18n returns the key
    return translated !== fullKey && translated !== undefined;
  };

  return { t, hasTranslation, i18n };
};
