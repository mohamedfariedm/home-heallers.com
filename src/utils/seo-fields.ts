import { generateArabicSlug, generateSlug } from '@/utils/generate-slug';
import type { LocaleTextMap, SeoLocale } from '@/types/seo-locale';

export function emptyLocaleMap(): LocaleTextMap {
  return { en: null, ar: null };
}

export function asLocaleTextMap(value: unknown): LocaleTextMap {
  if (value == null || value === '') return emptyLocaleMap();
  if (typeof value === 'string') {
    return { en: value, ar: null };
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      en: typeof obj.en === 'string' ? obj.en : obj.en == null ? null : String(obj.en),
      ar: typeof obj.ar === 'string' ? obj.ar : obj.ar == null ? null : String(obj.ar),
    };
  }
  return emptyLocaleMap();
}

export function localeMapToForm(value: unknown): { en: string; ar: string } {
  const map = asLocaleTextMap(value);
  return {
    en: map.en ?? '',
    ar: map.ar ?? '',
  };
}

export function seoFormDefaults(record?: any) {
  return {
    slug: localeMapToForm(record?.slug),
    meta_title: localeMapToForm(record?.meta_title),
    meta_description: localeMapToForm(record?.meta_description),
    og_title: localeMapToForm(record?.og_title),
    og_description: localeMapToForm(record?.og_description),
  };
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
}

function htmlRichness(value: string): number {
  return (
    (value.match(/<[^>]+>/g) || []).length +
    (value.match(/style=/gi) || []).length * 2 +
    (value.match(/class=/gi) || []).length
  );
}

function richerHtml(left: string, right: string): string {
  if (!left) return right;
  if (!right) return left;
  return htmlRichness(left) >= htmlRichness(right) ? left : right;
}

/** Prefer the HTML that still has tags/inline styles when list and show payloads differ. */
export function mergeRichLocaleHtml(listValue: unknown, detailValue: unknown) {
  const list = localeMapToForm(listValue);
  const detail = localeMapToForm(detailValue);
  return {
    en: richerHtml(list.en, detail.en),
    ar: richerHtml(list.ar, detail.ar),
  };
}

export function mergeAdminFormRecord(listRow?: any, detail?: any) {
  const record = { ...(listRow || {}), ...(detail || {}) };
  if (listRow?.description || detail?.description) {
    record.description = mergeRichLocaleHtml(listRow?.description, detail?.description);
  }
  return Object.keys(record).length ? record : listRow;
}

function preserveRichHtml(original: string, next: string): string {
  if (!original) return next;
  if (!next) return original;
  const sameText =
    stripHtml(original).replace(/\s+/g, ' ') === stripHtml(next).replace(/\s+/g, ' ');
  if (sameText && htmlRichness(original) > htmlRichness(next)) {
    return original;
  }
  return next;
}

/** Keep loaded description HTML when Quill rewrites the same text without styles. */
export function preserveRichLocaleHtml(
  original: { en?: string | null; ar?: string | null } | undefined,
  next: { en?: string | null; ar?: string | null } | undefined
) {
  const prev = localeMapToForm(original);
  const curr = localeMapToForm(next);
  return {
    en: preserveRichHtml(prev.en, curr.en),
    ar: preserveRichHtml(prev.ar, curr.ar),
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function serializeLocaleMap(
  value: { en?: string | null; ar?: string | null } | undefined,
  options?: { stripTags?: boolean }
): LocaleTextMap {
  const strip = options?.stripTags !== false;
  const toValue = (raw: string | null | undefined) => {
    if (raw == null) return null;
    const cleaned = strip ? stripHtml(String(raw)) : String(raw).trim();
    return emptyToNull(cleaned);
  };
  return {
    en: toValue(value?.en),
    ar: toValue(value?.ar),
  };
}

export function normalizeEnglishSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function normalizeArabicSlug(value: string): string {
  return value.trim().replace(/\s+/g, '-');
}

export function serializeSlugMap(
  value: { en?: string | null; ar?: string | null } | undefined
): LocaleTextMap {
  const en = emptyToNull(value?.en);
  const ar = emptyToNull(value?.ar);
  return {
    en: en ? normalizeEnglishSlug(en) : null,
    ar: ar ? normalizeArabicSlug(ar) : null,
  };
}

export function localeMapsEqual(a: LocaleTextMap, b: LocaleTextMap): boolean {
  return (a.en ?? null) === (b.en ?? null) && (a.ar ?? null) === (b.ar ?? null);
}

export function shouldSendSlug(
  next: LocaleTextMap,
  loaded: LocaleTextMap | null,
  isCreate: boolean
): boolean {
  if (isCreate) {
    return next.en != null || next.ar != null;
  }
  if (!loaded) return next.en != null || next.ar != null;
  return !localeMapsEqual(next, loaded);
}

export function generateLocaleSlug(name: string, locale: SeoLocale): string {
  if (!name.trim()) return '';
  return locale === 'ar' ? generateArabicSlug(name) : generateSlug(name);
}

export function buildEntitySeoPayload(
  data: {
    slug?: { en?: string | null; ar?: string | null };
    meta_title?: { en?: string | null; ar?: string | null };
    meta_description?: { en?: string | null; ar?: string | null };
    og_title?: { en?: string | null; ar?: string | null };
    og_description?: { en?: string | null; ar?: string | null };
  },
  loadedSlug: LocaleTextMap | null,
  isCreate: boolean
) {
  const slug = serializeSlugMap(data.slug);
  const payload: Record<string, LocaleTextMap> = {
    meta_title: serializeLocaleMap(data.meta_title),
    meta_description: serializeLocaleMap(data.meta_description),
    og_title: serializeLocaleMap(data.og_title),
    og_description: serializeLocaleMap(data.og_description),
  };
  if (shouldSendSlug(slug, loadedSlug, isCreate)) {
    payload.slug = slug;
  }
  return payload;
}

export function listSlugSubtitle(slugEn: string | null | undefined): string {
  return slugEn?.trim() ? slugEn : '—';
}

export function extractValidationErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  const response = (error as any)?.response?.data ?? {};

  const collect = (bag: unknown) => {
    if (!bag || typeof bag !== 'object' || Array.isArray(bag)) return;
    Object.entries(bag as Record<string, unknown>).forEach(([key, messages]) => {
      if (result[key]) return;
      if (Array.isArray(messages) && messages[0] != null) {
        result[key] = String(messages[0]);
      } else if (typeof messages === 'string' && messages.trim()) {
        result[key] = messages;
      }
    });
  };

  collect(response.errors);

  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    collect(response.data);
  }

  if (Object.keys(result).length === 0) {
    const fallback =
      (typeof response.msg === 'string' && response.msg) ||
      (typeof response.message === 'string' && response.message) ||
      (typeof (error as any)?.message === 'string' && (error as any).message) ||
      '';
    if (fallback) {
      const fieldMatch = fallback.match(
        /\b(slug|meta_title|meta_description|og_title|og_description)\.(en|ar)\b/i
      );
      result[fieldMatch ? fieldMatch[0] : '_form'] = fallback;
    }
  }

  return result;
}

export function localeFromErrorKeys(keys: string[]): SeoLocale | null {
  if (keys.some((key) => key.endsWith('.en') || key.includes('.en.'))) return 'en';
  if (keys.some((key) => key.endsWith('.ar') || key.includes('.ar.'))) return 'ar';
  return null;
}

export function isFieldValidationError(error: unknown): boolean {
  const status = (error as any)?.response?.status;
  if (status === 422) return true;
  if (status === 401) {
    const data = (error as any)?.response?.data;
    return Boolean(data && (data.msg || data.data) && data.status !== undefined);
  }
  return false;
}

export function applySeoValidationErrors(
  error: unknown,
  setError: (name: any, error: { type: string; message: string }) => void
): SeoLocale | null {
  const fieldErrors = extractValidationErrors(error);
  Object.entries(fieldErrors).forEach(([key, message]) => {
    if (key === '_form') return;
    setError(key, { type: 'server', message });
  });
  return localeFromErrorKeys(Object.keys(fieldErrors));
}
