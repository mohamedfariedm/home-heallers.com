'use client';

import cn from '@/utils/class-names';
import type { SeoLocale } from '@/types/seo-locale';

export default function SeoLocaleTabs({
  locale,
  onChange,
}: {
  locale: SeoLocale;
  onChange: (locale: SeoLocale) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {(['en', 'ar'] as SeoLocale[]).map((key) => {
        const selected = locale === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={selected}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-semibold transition',
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {key.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
