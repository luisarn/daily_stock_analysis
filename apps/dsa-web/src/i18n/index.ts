import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh/common.json';
import enHome from './locales/en/home.json';
import zhHome from './locales/zh/home.json';
import enBacktest from './locales/en/backtest.json';
import zhBacktest from './locales/zh/backtest.json';
import enLogin from './locales/en/login.json';
import zhLogin from './locales/zh/login.json';
import enSettings from './locales/en/settings.json';
import zhSettings from './locales/zh/settings.json';
import enChat from './locales/en/chat.json';
import zhChat from './locales/zh/chat.json';
import enPortfolio from './locales/en/portfolio.json';
import zhPortfolio from './locales/zh/portfolio.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, home: enHome, backtest: enBacktest, login: enLogin, settings: enSettings, chat: enChat, portfolio: enPortfolio },
      zh: { common: zhCommon, home: zhHome, backtest: zhBacktest, login: zhLogin, settings: zhSettings, chat: zhChat, portfolio: zhPortfolio },
    },
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
