const path = require('path');
const themeConfig = require('./theme.config.tsx').default;
const supportedLngs = ['da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'ja', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh', 'ae'];
const ni18nConfig = {
    fallbackLng: [themeConfig.locale || 'en'],
    supportedLngs,
    ns: ['translation'],
    react: { useSuspense: false },
    backend: {
        loadPath: path.resolve(`/locales/{{lng}}.json`),
    },
};

module.exports = { ni18nConfig };
