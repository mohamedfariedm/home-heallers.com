'use client';

import cn from '@/utils/class-names';
import type { OfferLocale } from '@/types/offer';

export default function LocaleTabs({
  locale,
  onChange,
  completeness,
}: {
  locale: OfferLocale;
  onChange: (locale: OfferLocale) => void;
  completeness: { en: { filled: number; total: number }; ar: { filled: number; total: number } };
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only" aria-live="polite">
        Editing {locale === 'ar' ? 'Arabic' : 'English'} content
      </span>
      {(['en', 'ar'] as OfferLocale[]).map((key) => {
        const count = completeness[key];
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
            {key.toUpperCase()}{' '}
            <span className="text-xs font-normal text-gray-500">
              {count.filled}/{count.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
