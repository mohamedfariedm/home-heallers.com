import Cookies from 'js-cookie';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import type {
  LocaleListMap,
  OfferLocale,
  OfferStatus,
  TranslationMap,
} from '@/types/offer';
import { LIST_FIELDS, TRANSLATABLE_FIELDS } from '@/types/offer';

export function getDashboardLocale(): OfferLocale {
  const locale = Cookies.get('NEXT_LOCALE');
  return locale === 'ar' ? 'ar' : 'en';
}

export function offerDisplayName(
  name: unknown,
  locale: OfferLocale = getDashboardLocale()
): string {
  const resolved = resolveLocalizedName(name, locale);
  if (resolved) return resolved;
  if (name && typeof name === 'object') {
    const first = Object.values(name as Record<string, unknown>).find(
      (value) => typeof value === 'string' && value.trim()
    );
    if (typeof first === 'string') return first;
  }
  return '';
}

export function unwrapPackage(res: unknown): any | null {
  const response = res as any;
  const payload =
    response &&
    typeof response.status === 'number' &&
    response.data !== undefined
      ? response.data
      : response;
  const data = payload?.data;
  if (Array.isArray(data)) return data[0] ?? null;
  if (data && typeof data === 'object') return data;
  return payload ?? null;
}

export function getAttachmentUrl(image: unknown): string {
  if (!image) return '';
  const first = Array.isArray(image) ? image[0] : image;
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object') {
    return (
      (first as any).thumbnail ||
      (first as any).original ||
      (first as any).url ||
      ''
    );
  }
  return '';
}

export function emptyTranslation(): TranslationMap {
  return { en: '', ar: '' };
}

export function asTranslationMap(value: unknown): TranslationMap {
  if (!value) return emptyTranslation();
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return asTranslationMap(parsed);
      }
    } catch {
      return { en: value, ar: '' };
    }
    return { en: value, ar: '' };
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return {
      en: typeof obj.en === 'string' ? obj.en : '',
      ar: typeof obj.ar === 'string' ? obj.ar : '',
    };
  }
  return emptyTranslation();
}

export function asLocaleList(value: unknown): { en: string[]; ar: string[] } {
  const toList = (item: unknown): string[] => {
    if (!item) return [];
    if (Array.isArray(item)) {
      return item
        .map((row) => (typeof row === 'string' ? row : String(row ?? '')))
        .filter((row) => row.trim() !== '');
    }
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return toList(parsed);
        } catch {
          return [trimmed];
        }
      }
      return [trimmed];
    }
    return [];
  };

  if (!value) return { en: [], ar: [] };
  if (Array.isArray(value)) return { en: toList(value), ar: [] };
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return {
      en: toList(obj.en),
      ar: toList(obj.ar),
    };
  }
  return { en: toList(value), ar: [] };
}

export function compactLocaleList(map: LocaleListMap): LocaleListMap {
  return {
    en: (map.en ?? []).map((row) => row.trim()).filter(Boolean),
    ar: (map.ar ?? []).map((row) => row.trim()).filter(Boolean),
  };
}

export function deriveOfferStatus(values: {
  is_active?: boolean | number | null;
  starts_at?: string | null;
  ends_at?: string | null;
}): OfferStatus {
  const isActive = Boolean(values.is_active);
  const now = Date.now();
  const startsAt = values.starts_at ? new Date(values.starts_at).getTime() : NaN;
  const endsAt = values.ends_at ? new Date(values.ends_at).getTime() : NaN;
  const ended = Number.isFinite(endsAt) && endsAt < now;

  if (ended && isActive) return 'expired';
  if (ended && !isActive) return 'archived';
  if (!isActive) return 'draft';
  if (Number.isFinite(startsAt) && startsAt > now) return 'scheduled';
  return 'published';
}

export function computePricing(oldPrice?: number | null, price?: number | null) {
  if (oldPrice == null || Number.isNaN(oldPrice) || oldPrice <= 0) {
    return { savings_amount: null as number | null, discount_percentage: null as number | null };
  }
  if (price == null || Number.isNaN(price)) {
    return { savings_amount: null as number | null, discount_percentage: null as number | null };
  }
  if (oldPrice <= price) {
    return { savings_amount: null as number | null, discount_percentage: null as number | null };
  }
  const savings = Math.round((oldPrice - price) * 100) / 100;
  const discount = Math.round((savings / oldPrice) * 10000) / 100;
  return { savings_amount: savings, discount_percentage: discount };
}

export function localeCompleteness(
  values: Record<string, any>,
  locale: OfferLocale
): { filled: number; total: number } {
  let filled = 0;
  const total = TRANSLATABLE_FIELDS.length;
  for (const field of TRANSLATABLE_FIELDS) {
    const value = values[field];
    if (LIST_FIELDS.includes(field as (typeof LIST_FIELDS)[number])) {
      const list = value?.[locale];
      if (Array.isArray(list) && list.some((item) => typeof item === 'string' && item.trim())) {
        filled += 1;
      }
    } else if (typeof value?.[locale] === 'string' && value[locale].trim()) {
      filled += 1;
    }
  }
  return { filled, total };
}

export function seoLocaleWarning(values: Record<string, any>): string | null {
  const titleEn = Boolean(values.meta_title?.en?.trim());
  const titleAr = Boolean(values.meta_title?.ar?.trim());
  const descEn = Boolean(values.meta_description?.en?.trim());
  const descAr = Boolean(values.meta_description?.ar?.trim());
  const titlePartial = titleEn !== titleAr && (titleEn || titleAr);
  const descPartial = descEn !== descAr && (descEn || descAr);
  if (titlePartial || descPartial) {
    return 'SEO fields are only filled in one locale. A half-translated offer page is worse for SEO than an untranslated one.';
  }
  return null;
}

export function pickDirtyPayload(
  values: Record<string, any>,
  dirtyFields: Record<string, any>
): Record<string, any> {
  const payload: Record<string, any> = {};
  Object.keys(dirtyFields || {}).forEach((key) => {
    if (key === 'discount') return;
    payload[key] = values[key];
  });
  if (payload.highlights || payload.package_includes || payload.suitable_conditions || payload.patient_journey || payload.tags) {
    LIST_FIELDS.forEach((field) => {
      if (payload[field]) payload[field] = compactLocaleList(payload[field]);
    });
  }
  return payload;
}

export function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace('T', ' ');
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

export function isAllowedLinkHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href.trim());
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  expired: 'Expired',
  archived: 'Archived',
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
};
