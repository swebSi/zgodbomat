import { i18n, type Messages } from '@lingui/core';
import { getLocales } from 'expo-localization';
import { LanguageList, type LanguageType } from './model/localize';

// Use compiled JS bundles (CommonJS) so hashed message IDs resolve correctly
// eslint-disable-next-line @typescript-eslint/no-var-requires
const enBundle = require('./locales/en/messages.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slBundle = require('./locales/sl/messages.js');

const enMessages: Messages = enBundle.messages ?? enBundle;
const slMessages: Messages = slBundle.messages ?? slBundle;

const ALL_MESSAGES: Record<LanguageType, Messages> = {
  en: enMessages,
  sl: slMessages,
};

const SUPPORTED_LOCALES = Object.keys(ALL_MESSAGES) as LanguageType[];

function pickBestSupportedLocale(): LanguageType {
  const deviceLanguage = getLocales()[0]?.languageCode || LanguageList.EN;
  console.log(deviceLanguage);
  const candidate = (deviceLanguage?.split('-')[0] || LanguageList.EN) as LanguageType;
  return SUPPORTED_LOCALES.includes(candidate) ? candidate : LanguageList.EN;
}

export function activateI18n(locale: LanguageType) {
  const validLocale = SUPPORTED_LOCALES.includes(locale) ? locale : LanguageList.EN;
  i18n.loadAndActivate({ locale: validLocale, messages: ALL_MESSAGES[validLocale] });
  return validLocale;
}

export function initI18n(initialLocale?: LanguageType) {
  const locale = initialLocale ?? pickBestSupportedLocale();
  return activateI18n(locale);
}

// Initialize immediately so first render is localized
initI18n();

export default i18n;
