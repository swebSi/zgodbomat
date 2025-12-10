export enum LanguageList {
  EN = 'en',
  SL = 'sl',
}

export type LanguageType = Lowercase<keyof typeof LanguageList>;
