import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Preload only ko + en (fallback) statically — all others loaded on demand
import ko from './locales/ko/common.json';
import en from './locales/en/common.json';
import koF from './locales/ko/fortune.json';
import enF from './locales/en/fortune.json';

// Vite dynamic import globs for lazy loading
const commonModules = import.meta.glob('./locales/*/common.json');
const fortuneModules = import.meta.glob('./locales/*/fortune.json');

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

// Dynamically load a language's resources
async function loadLanguage(lng: string): Promise<boolean> {
  if (i18n.hasResourceBundle(lng, 'translation')) return true;

  const commonPath = `./locales/${lng}/common.json`;
  const fortunePath = `./locales/${lng}/fortune.json`;

  const commonLoader = commonModules[commonPath];
  const fortuneLoader = fortuneModules[fortunePath];
  if (!commonLoader || !fortuneLoader) return false;

  const [common, fortune] = await Promise.all([
    commonLoader() as Promise<{ default: Record<string, unknown> }>,
    fortuneLoader() as Promise<{ default: Record<string, unknown> }>,
  ]);

  i18n.addResourceBundle(lng, 'translation', merge(common.default, fortune.default));
  return true;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: merge(ko, koF) },
      en: { translation: merge(en, enF) },
    },
    lng: localStorage.getItem('i18nextLng') || undefined,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    supportedLngs: ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'de', 'it', 'tr'],
    nonExplicitSupportedLngs: false,
  });

const RTL_LANGUAGES = new Set(['ar']);

// Load language resources before switching
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng?: string, callback?: i18n.Callback) => {
  if (lng) await loadLanguage(lng);
  return originalChangeLanguage(lng, callback);
};

// Set document direction on language change
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.dir = RTL_LANGUAGES.has(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Load detected language if not preloaded (ko/en)
const detectedLng = i18n.language;
if (detectedLng && detectedLng !== 'ko' && detectedLng !== 'en') {
  loadLanguage(detectedLng).then((ok) => {
    if (ok) {
      // Re-trigger to apply loaded resources
      i18n.emit('languageChanged', detectedLng);
      // Force React re-render with loaded resources
      originalChangeLanguage(detectedLng);
    }
  });
}

// Set initial direction
document.documentElement.dir = RTL_LANGUAGES.has(i18n.language) ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export { loadLanguage };

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
