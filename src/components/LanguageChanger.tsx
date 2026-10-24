'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SelectBox from '@/components/ui/select';
import {
  getLocaleFromPathname,
  isSupportedLocale,
  localeDir,
  setLocaleCookie,
  withLocalePrefix,
} from '@/lib/locale';
import i18n from '@/lib/i18n';

export default function LanguageChanger(_props?: {
  buttonClassName?: string;
}) {
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const currentLocale = getLocaleFromPathname(currentPathname);

  const [selectedLang, setSelectedLang] = useState(currentLocale);

  useEffect(() => {
    setSelectedLang(currentLocale);
  }, [currentLocale]);

  const options = [
    { name: 'En', value: 'en' },
    { name: 'Ar', value: 'ar' },
  ];

  const handleChange = (newLocale: string) => {
    if (!isSupportedLocale(newLocale) || newLocale === currentLocale) return;

    setSelectedLang(newLocale);
    setLocaleCookie(newLocale);
    void i18n.changeLanguage(newLocale);

    const dir = localeDir(newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = dir;
    document.body.dir = dir;

    const params = new URLSearchParams(searchParams);
    const newPath = withLocalePrefix(currentPathname, newLocale);
    const fullUrl = params.toString() ? `${newPath}?${params}` : newPath;

    window.location.replace(fullUrl);
  };

  return (
    <SelectBox
      suffix={false}
      variant="text"
      size="sm"
      placeholder="Select Language"
      options={options}
      onChange={handleChange}
      value={selectedLang}
      className="h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100"
      dropdownClassName="p-0 m-1"
      getOptionValue={(option) => option.value}
      displayValue={(selected) =>
        options.find((r) => r.value === selected)?.name ?? ''
      }
    />
  );
}
