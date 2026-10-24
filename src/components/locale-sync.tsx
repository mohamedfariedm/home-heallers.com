'use client';

import { useLayoutEffect } from 'react';
import i18n from '@/lib/i18n';
import { useDirection } from '@/hooks/use-direction';
import {
  isSupportedLocale,
  localeDir,
  setLocaleCookie,
} from '@/lib/locale';

/**
 * Keeps i18next, the locale cookie, and html/body dir in lockstep with the URL.
 * Language and RTL/LTR only change when the [locale] segment changes.
 */
export default function LocaleSync({ locale }: { locale: string }) {
  const { setDirection } = useDirection();

  useLayoutEffect(() => {
    if (!isSupportedLocale(locale)) return;

    setLocaleCookie(locale);

    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }

    const dir = localeDir(locale);
    setDirection(dir);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [locale, setDirection]);

  return null;
}
