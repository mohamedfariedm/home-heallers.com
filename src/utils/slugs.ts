import { generateSlug } from '@/utils/generate-slug';

/**
 * Category slug is a string. Service and news slugs are { en, ar } objects
 * with the same English value in both keys (generated from the English name).
 *
 *   category.slug          → string          "home-care"
 *   service.slug.{en,ar}   → { en, ar }      editable; empty fields fall back to English name
 *   news.slug.{en,ar}      → { en, ar }      both keys hold the same English value
 */

export type AppLocale = 'en' | 'ar';

export type LocaleSlug = {
  en?: string | null;
  ar?: string | null;
};

export function resolveApiLanguage(locale?: string | null): AppLocale {
  return locale && locale.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function asLocaleSlug(value: unknown): LocaleSlug | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as LocaleSlug;
}

/** Category slug is a plain English string. Never index it with ['en']. */
export function getCategorySlug(category: { slug?: unknown } | null | undefined): string {
  const slug = category?.slug;
  if (typeof slug === 'string') return slug;
  const nested = asLocaleSlug(slug);
  return nested?.en || nested?.ar || '';
}

/** Service slug is a locale object. Pick the key for the active locale. */
export function getServiceSlug(
  service: { slug?: unknown } | null | undefined,
  locale: AppLocale = 'en'
): string {
  const slug = service?.slug;
  if (typeof slug === 'string') return slug;
  const nested = asLocaleSlug(slug);
  if (!nested) return '';
  return (nested[locale] || nested.en || nested.ar || '') as string;
}

/** Resolve service slug payload: user input wins; empty fields fall back to English name. */
export function resolveServiceSlugPayload(
  slug: { en?: string; ar?: string } | undefined,
  englishName: string
): { en: string; ar: string } {
  const fallback = generateSlug(englishName || '');
  const en = slug?.en?.trim() || fallback;
  const ar = slug?.ar?.trim() || fallback;
  return { en, ar };
}

/** Blog slug is English in both keys. Prefer `.en`; either works. */
export function getBlogSlug(news: { slug?: unknown } | null | undefined): string {
  const slug = news?.slug;
  if (typeof slug === 'string') return slug;
  const nested = asLocaleSlug(slug);
  return nested?.en || nested?.ar || '';
}

export function encodeSlugPath(slug: string): string {
  return encodeURIComponent(slug);
}

/**
 * News `created_at` / `updated_at` may be `DD-MM-YYYY`.
 * `new Date('22-08-2026')` is Invalid Date.
 */
export function parseApiDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value !== 'string') return null;

  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const iso = new Date(value);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

/** Collection (`message`) vs detail (`msg`) envelopes. */
export function unwrapClientResponse<T = unknown>(res: {
  data?: T;
  message?: string;
  msg?: string;
}): { data: T | undefined; message: string | undefined } {
  return {
    data: res?.data,
    message: res?.message ?? res?.msg,
  };
}
