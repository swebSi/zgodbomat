/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['en', 'sl'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'src/shared/i18n/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
};
