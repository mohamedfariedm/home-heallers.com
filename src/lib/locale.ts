import i18nConfig from '@/i18nConfig';

export const SUPPORTED_LOCALES = i18nConfig.locales as string[];
export const DEFAULT_LOCALE = i18nConfig.defaultLocale as string;
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isSupportedLocale(value: unknown): value is string {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
}

export function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function localeDir(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function withLocalePrefix(path: string, locale: string): string {
  const [pathname, search] = path.split('?');
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const parts = normalized.split('/').filter(Boolean);
  const rest = isSupportedLocale(parts[0]) ? parts.slice(1) : parts;
  const localized = rest.length ? `/${locale}/${rest.join('/')}` : `/${locale}`;
  return search ? `${localized}?${search}` : localized;
}

export function readLocaleCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  return isSupportedLocale(value) ? value : undefined;
}

export function setLocaleCookie(locale: string) {
  if (typeof document === 'undefined' || !isSupportedLocale(locale)) return;
  const expires = new Date(Date.now() + LOCALE_COOKIE_MAX_AGE * 1000);
  document.cookie = `${LOCALE_COOKIE}=${locale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}
