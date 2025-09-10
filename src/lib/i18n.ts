import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-resources-to-backend';
import i18nConfig from '@/i18nConfig';

function getInitialLocale() {
  if (typeof window === 'undefined') return i18nConfig.defaultLocale;

  // Get locale from cookie (set by LanguageChanger)
  const match = document.cookie.match(/(?:^| )NEXT_LOCALE=([^;]*)/);
  return match?.[1] || i18nConfig.defaultLocale;
}

i18n
  .use(Backend((language: string, namespace: string) =>
    import(`../../public/locales/${language}/${namespace}.json`)
  ))
  .use(initReactI18next)
  .init({
    lng: getInitialLocale(),
    supportedLngs: i18nConfig.locales,
    fallbackLng: i18nConfig.defaultLocale,
    ns: ['common'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
