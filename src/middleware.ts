import i18nConfig from './i18nConfig';
import { NextRequest, NextResponse } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function getBrowserLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales: string[] = i18nConfig.locales;
  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    return matchLocale(languages, locales, i18nConfig.defaultLocale);
  } catch {
    return i18nConfig.defaultLocale;
  }
}

function getPathLocale(pathname: string): string | undefined {
  return i18nConfig.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
}

function getCookieLocale(request: NextRequest): string | undefined {
  const value = request.cookies.get(LOCALE_COOKIE)?.value;
  return value && i18nConfig.locales.includes(value) ? value : undefined;
}

/**
 * URL locale wins. Cookie is next so a chosen language survives unprefixed
 * links. Browser Accept-Language is only used on first visit (no cookie).
 */
function resolveLocale(request: NextRequest): string {
  return (
    getPathLocale(request.nextUrl.pathname) ||
    getCookieLocale(request) ||
    getBrowserLocale(request) ||
    i18nConfig.defaultLocale
  );
}

function withLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken =
    request.cookies.get('auth_token')?.value &&
    request.cookies.get('auth_token')?.value !== '';
  const isAuthRoute = pathname.includes('/auth');
  const isLandingBuilder = pathname.includes('landing-builder');

  const locale = resolveLocale(request);

  if (!hasToken && !isAuthRoute && !isLandingBuilder) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    url.search = '';
    return withLocaleCookie(NextResponse.redirect(url), locale);
  }

  const pathLocale = getPathLocale(pathname);
  if (pathLocale) {
    const response = NextResponse.next();
    if (getCookieLocale(request) !== pathLocale) {
      withLocaleCookie(response, pathLocale);
    }
    return response;
  }

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return withLocaleCookie(NextResponse.redirect(request.nextUrl), locale);
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next).*)'],
};
