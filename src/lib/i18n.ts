import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-resources-to-backend';
import i18nConfig from '@/i18nConfig';
import { I18N_NAMESPACES } from '@/config/i18n-namespaces';
import { getLocaleFromPathname, isSupportedLocale, readLocaleCookie } from '@/lib/locale';

function getInitialLocale() {
  if (typeof window === 'undefined') return i18nConfig.defaultLocale;

  // URL is the source of truth so a stale cookie cannot flip the language.
  const pathLocale = getLocaleFromPathname(window.location.pathname);
  if (isSupportedLocale(pathLocale)) return pathLocale;

  return readLocaleCookie() || i18nConfig.defaultLocale;
}

if (!i18n.isInitialized) {
  i18n
    .use(
      Backend((language: string, namespace: string) =>
        import(`../../public/locales/${language}/${namespace}.json`)
      )
    )
    .use(initReactI18next)
    .init({
      lng: getInitialLocale(),
      supportedLngs: i18nConfig.locales,
      fallbackLng: i18nConfig.defaultLocale,
      ns: [...I18N_NAMESPACES],
      defaultNS: 'common',
      fallbackNS: 'common',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
