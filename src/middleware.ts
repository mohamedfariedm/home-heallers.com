// import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
// import withAuth from 'next-auth/middleware';
// import { i18nRouter } from 'next-i18n-router';
import i18nConfig from './i18nConfig';
import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = i18nConfig.locales
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  const locale = matchLocale(languages, locales, i18nConfig.defaultLocale)
  return locale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken =
    request.cookies.get('auth_token')?.value &&
    request.cookies.get('auth_token')?.value !== ''
  const isAuthRoute = pathname.includes('/auth')
  const isLandingBuilder = pathname.includes('landing-builder')

  if (!hasToken && !isAuthRoute && !isLandingBuilder) {
    const url = request.nextUrl.clone()
    return NextResponse.redirect(`${url.origin}/auth/login`)
  }

  const pathnameHasLocale = i18nConfig.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )
  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
  
  // return i18nRouter(request, i18nConfig);
}

// export default withAuth({
//   pages: {
//     ...pagesOptions,
//   },
// });

export const config = {
  // restricted routes
  matcher: [
    '/((?!api|static|.*\\..*|_next).*)',
  ]
  // matcher: [
  //   '/',
  //   '/analytics',
  //   '/logistics/:path*',
  //   '/ecommerce/:path*',
  //   '/support/:path*',
  //   '/file/:path*',
  //   '/file-manager',
  //   '/invoice/:path*',
  //   '/forms/profile-settings/:path*',
  // ],
};
