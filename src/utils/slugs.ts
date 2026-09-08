import { generateSlug } from '@/utils/generate-slug';
import { asLocaleTextMap } from '@/utils/seo-fields';

/**
 * Admin category, service, and news slugs are locale maps `{ en, ar }`.
 * Public category APIs may still return a single string for the request locale.
 *
 *   category.slug.{en,ar}  → independent per locale (admin)
 *   service.slug.{en,ar}   → independent per locale
 *   news.slug.{en,ar}      → independent per locale
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

function pickLocaleSlug(value: unknown, locale: AppLocale = 'en'): string {
  if (typeof value === 'string') return value;
  const nested = asLocaleSlug(value);
  if (!nested) return '';
  return (nested[locale] || nested.en || nested.ar || '') as string;
}

/** Admin category slug is `{ en, ar }`. Public category APIs may still return a string. */
export function getCategorySlug(
  category: { slug?: unknown } | null | undefined,
  locale: AppLocale = 'en'
): string {
  return pickLocaleSlug(category?.slug, locale);
}

/** Service slug is a locale object. Pick the key for the active locale. */
export function getServiceSlug(
  service: { slug?: unknown } | null | undefined,
  locale: AppLocale = 'en'
): string {
  return pickLocaleSlug(service?.slug, locale);
}

/** @deprecated Client no longer generates slug on submit; backend fills omitted locales from name. */
export function resolveServiceSlugPayload(
  slug: { en?: string; ar?: string } | undefined,
  englishName: string
): { en: string; ar: string } {
  const fallback = generateSlug(englishName || '');
  const en = slug?.en?.trim() || fallback;
  const ar = slug?.ar?.trim() || fallback;
  return { en, ar };
}

/** Blog/news slug is independent per locale. Prefer the active locale. */
export function getBlogSlug(
  news: { slug?: unknown } | null | undefined,
  locale: AppLocale = 'en'
): string {
  return pickLocaleSlug(news?.slug, locale);
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

/** GET/POST/PUT show+write envelopes return `data: [record]`. Listing is `data: T[]`. */
export function unwrapAdminRecord<T = any>(res: unknown): T | null {
  const payload = res as any;
  const data = payload?.data;
  if (Array.isArray(data)) return (data[0] ?? null) as T | null;
  if (data && typeof data === 'object') return data as T;
  return (payload ?? null) as T | null;
}

export function getLocaleSlugMap(value: unknown): LocaleSlug {
  return asLocaleTextMap(value);
}
