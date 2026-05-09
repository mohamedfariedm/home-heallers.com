import {
  LANDING_LEGACY_CONFIG_KEY,
  LANDING_PROJECT_STORAGE_KEY,
  type LandingProjectState,
  type LandingPageDocument,
  type LandingLocale,
  type LandingLocaleConfig,
} from '@/types/landing-project';
import { mergeLandingPageSeo, type LandingPageSeo } from '@/types/landing-seo';
import { mergeLandingConfig } from '@/lib/landing-builder/defaults';
import type { CanvasPage } from '@/types/landing-canvas';
import { mergeCanvasPage, EMPTY_CANVAS_PAGE } from '@/lib/landing-builder/canvas-defaults';
import { normalizeStoredCanvas } from '@/lib/landing-builder/migrate-to-canvas';

function nowIso() {
  return new Date().toISOString();
}

function slugifyName(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'landing-page';
}

function ensureUniqueSlug(
  desired: string,
  pages: Pick<LandingPageDocument, 'id' | 'slug'>[],
  ignoreId?: string,
) {
  const seed = slugifyName(desired);
  let slug = seed;
  let n = 2;
  const exists = (s: string) =>
    pages.some((p) => p.slug === s && (ignoreId ? p.id !== ignoreId : true));
  while (exists(slug)) {
    slug = `${seed}-${n}`;
    n += 1;
  }
  return slug;
}

function cloneCanvasForLocale(canvas: CanvasPage): CanvasPage {
  return mergeCanvasPage(JSON.parse(JSON.stringify(canvas)) as CanvasPage);
}

const DEFAULT_LOCALES: LandingLocaleConfig[] = [
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', label: 'Arabic', dir: 'rtl', flag: '🇸🇦' },
];

function canvasLocalesFromLegacy(
  raw: { canvasLocales?: Record<string, unknown>; locales?: LandingLocaleConfig[] },
  legacyCanvas: CanvasPage,
): Record<LandingLocale, CanvasPage> {
  const localeConfigs = raw.locales?.length ? raw.locales : DEFAULT_LOCALES;
  const next: Record<LandingLocale, CanvasPage> = {};
  const primaryCode = localeConfigs[0]?.code ?? 'en';
  const primaryRaw = raw.canvasLocales?.[primaryCode] ?? raw.canvasLocales?.en;
  const primaryCanvas = primaryRaw
    ? mergeCanvasPage(primaryRaw as CanvasPage)
    : mergeCanvasPage(legacyCanvas);
  for (const loc of localeConfigs) {
    const fromRaw = raw.canvasLocales?.[loc.code];
    next[loc.code] = fromRaw
      ? mergeCanvasPage(fromRaw as CanvasPage)
      : cloneCanvasForLocale(primaryCanvas);
  }
  return next;
}

function normalizePage(raw: unknown): LandingPageDocument {
  const p = raw as LandingPageDocument & { config?: unknown; canvas?: unknown };
  const legacy =
    p.config && typeof p.config === 'object'
      ? mergeLandingConfig(p.config as Parameters<typeof mergeLandingConfig>[0])
      : undefined;
  const legacyCanvas = normalizeStoredCanvas(p.canvas, legacy);
  const canvasLocales = canvasLocalesFromLegacy(p, legacyCanvas);
  const seo = mergeLandingPageSeo(undefined, (p as { seo?: Partial<LandingPageSeo> }).seo);
  const localesRaw = (p as { locales?: LandingLocaleConfig[] }).locales;
  const locales =
    Array.isArray(localesRaw) && localesRaw.length > 0
      ? localesRaw
      : DEFAULT_LOCALES;
  return {
    id: p.id,
    name: typeof p.name === 'string' ? p.name : 'Untitled',
    slug: typeof (p as { slug?: unknown }).slug === 'string' ? (p as { slug: string }).slug : slugifyName(typeof p.name === 'string' ? p.name : 'Untitled'),
    locales,
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : nowIso(),
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : nowIso(),
    canvasLocales,
    seo,
  };
}

function newPageDoc(name: string, canvas: CanvasPage = EMPTY_CANVAS_PAGE): LandingPageDocument {
  const merged = mergeCanvasPage(canvas);
  const t = nowIso();
  const locales = DEFAULT_LOCALES;
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now()}`,
    name,
    slug: slugifyName(name),
    locales,
    createdAt: t,
    updatedAt: t,
    canvasLocales: locales.reduce<Record<LandingLocale, CanvasPage>>((acc, loc, i) => {
      acc[loc.code] = i === 0 ? merged : cloneCanvasForLocale(merged);
      return acc;
    }, {}),
    seo: mergeLandingPageSeo(undefined, {}),
  };
}

/** English canvas — for lists and thumbnails. */
export function getPageCanvasEn(doc: LandingPageDocument): CanvasPage {
  const primary = doc.locales[0]?.code ?? 'en';
  return doc.canvasLocales[primary] ?? mergeCanvasPage({});
}

export function duplicateLandingPage(
  src: LandingPageDocument,
  name: string,
): LandingPageDocument {
  const t = nowIso();
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now()}`,
    name,
    slug: slugifyName(name),
    createdAt: t,
    updatedAt: t,
    locales: src.locales,
    canvasLocales: src.locales.reduce<Record<LandingLocale, CanvasPage>>((acc, loc) => {
      acc[loc.code] = cloneCanvasForLocale(
        src.canvasLocales[loc.code] ?? src.canvasLocales[src.locales[0]?.code ?? 'en'],
      );
      return acc;
    }, {}),
    seo: mergeLandingPageSeo(undefined, src.seo),
  };
}

export function defaultLandingProject(): LandingProjectState {
  const doc = newPageDoc('Untitled page', EMPTY_CANVAS_PAGE);
  return {
    version: 1,
    pages: [doc],
    activePageId: null,
  };
}

export function loadLandingProject(): LandingProjectState {
  if (typeof window === 'undefined') return defaultLandingProject();
  try {
    const raw = localStorage.getItem(LANDING_PROJECT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LandingProjectState;
      if (parsed?.version === 1 && Array.isArray(parsed.pages)) {
        const normalizedPages = parsed.pages.map((p) => normalizePage(p));
        const used: Pick<LandingPageDocument, 'id' | 'slug'>[] = [];
        const pagesWithUniqueSlugs = normalizedPages.map((p) => {
          const slug = ensureUniqueSlug(p.slug || p.name, used);
          used.push({ id: p.id, slug });
          return { ...p, slug };
        });
        return {
          version: 1,
          pages: pagesWithUniqueSlugs,
          activePageId: parsed.activePageId ?? null,
        };
      }
    }
    const legacy = localStorage.getItem(LANDING_LEGACY_CONFIG_KEY);
    if (legacy) {
      const config = mergeLandingConfig(JSON.parse(legacy));
      const doc = newPageDoc('My landing page', normalizeStoredCanvas(null, config));
      const next: LandingProjectState = {
        version: 1,
        pages: [doc],
        activePageId: null,
      };
      localStorage.setItem(LANDING_PROJECT_STORAGE_KEY, JSON.stringify(next));
      return next;
    }
  } catch {
    /* ignore */
  }
  return defaultLandingProject();
}

export function saveLandingProject(state: LandingProjectState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANDING_PROJECT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export { newPageDoc };
export { ensureUniqueSlug, slugifyName };
