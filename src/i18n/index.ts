import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ko from './locales/ko/common.json';
import en from './locales/en/common.json';
import ja from './locales/ja/common.json';
import zhCN from './locales/zh-CN/common.json';
import zhTW from './locales/zh-TW/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';
import pt from './locales/pt/common.json';
import hi from './locales/hi/common.json';
import ar from './locales/ar/common.json';
import bn from './locales/bn/common.json';
import ru from './locales/ru/common.json';
import de from './locales/de/common.json';
import it from './locales/it/common.json';
import tr from './locales/tr/common.json';

import koF from './locales/ko/fortune.json';
import enF from './locales/en/fortune.json';
import jaF from './locales/ja/fortune.json';
import zhCNF from './locales/zh-CN/fortune.json';
import zhTWF from './locales/zh-TW/fortune.json';
import esF from './locales/es/fortune.json';
import frF from './locales/fr/fortune.json';
import ptF from './locales/pt/fortune.json';
import hiF from './locales/hi/fortune.json';
import arF from './locales/ar/fortune.json';
import bnF from './locales/bn/fortune.json';
import ruF from './locales/ru/fortune.json';
import deF from './locales/de/fortune.json';
import itF from './locales/it/fortune.json';
import trF from './locales/tr/fortune.json';

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      result[key] && typeof result[key] === 'object' && !Array.isArray(result[key]) &&
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function merge(common: Record<string, unknown>, fortune: Record<string, unknown>) {
  return deepMerge(common, fortune);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: merge(ko, koF) },
      en: { translation: merge(en, enF) },
      ja: { translation: merge(ja, jaF) },
      'zh-CN': { translation: merge(zhCN, zhCNF) },
      'zh-TW': { translation: merge(zhTW, zhTWF) },
      es: { translation: merge(es, esF) },
      fr: { translation: merge(fr, frF) },
      pt: { translation: merge(pt, ptF) },
      hi: { translation: merge(hi, hiF) },
      ar: { translation: merge(ar, arF) },
      bn: { translation: merge(bn, bnF) },
      ru: { translation: merge(ru, ruF) },
      de: { translation: merge(de, deF) },
      it: { translation: merge(it, itF) },
      tr: { translation: merge(tr, trF) },
    },
    lng: localStorage.getItem('i18nextLng') || undefined,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupFromNavigator: true,
    },
    supportedLngs: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'de', 'it', 'tr'],
    nonExplicitSupportedLngs: false,
  });

const RTL_LANGUAGES = new Set(['ar']);

// Set document direction on language change
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.dir = RTL_LANGUAGES.has(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = RTL_LANGUAGES.has(i18n.language) ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

export default i18n;
