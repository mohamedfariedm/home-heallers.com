'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import i18nConfig from '@/i18nConfig';
import SelectBox from '@/components/ui/select';

export default function LanguageChanger({
  buttonClassName,
}: {
  buttonClassName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPathname = usePathname();

  const params = new URLSearchParams(searchParams);
  const segments = currentPathname.split('/');
  const currentLocale = segments[1];

  const [selectedLang, setSelectedLang] = useState(currentLocale);

  const options = [
    { name: 'En', value: 'en' },
    { name: 'Ar', value: 'ar' },
  ];

  const handleChange = (newLocale: string) => {
    if (!i18nConfig.locales.includes(newLocale)) return;

    setSelectedLang(newLocale);

    // Set NEXT_LOCALE cookie
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    document.cookie = `NEXT_LOCALE=${newLocale}; expires=${date.toUTCString()}; path=/`;

    // Reconstruct path with new locale
    const newSegments = [...segments];
    newSegments[1] = newLocale;
    const newPath = newSegments.join('/');
    const fullUrl = params.toString() ? `${newPath}?${params}` : newPath;

    // Navigate then reload
    window.location.replace(fullUrl); // Use replace to avoid adding to history
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
