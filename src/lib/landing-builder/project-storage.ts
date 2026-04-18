import {
  LANDING_LEGACY_CONFIG_KEY,
  LANDING_PROJECT_STORAGE_KEY,
  type LandingProjectState,
  type LandingPageDocument,
  type LandingLocale,
} from '@/types/landing-project';
import { mergeLandingPageSeo, type LandingPageSeo } from '@/types/landing-seo';
import { mergeLandingConfig } from '@/lib/landing-builder/defaults';
import type { CanvasPage } from '@/types/landing-canvas';
import { mergeCanvasPage, EMPTY_CANVAS_PAGE } from '@/lib/landing-builder/canvas-defaults';
import { normalizeStoredCanvas } from '@/lib/landing-builder/migrate-to-canvas';

function nowIso() {
  return new Date().toISOString();
}

function cloneCanvasForLocale(canvas: CanvasPage): CanvasPage {
  return mergeCanvasPage(JSON.parse(JSON.stringify(canvas)) as CanvasPage);
}

function canvasLocalesFromLegacy(
  raw: { canvasLocales?: Record<string, unknown> },
  legacyCanvas: CanvasPage,
): Record<LandingLocale, CanvasPage> {
  const enRaw = raw.canvasLocales?.en;
  const arRaw = raw.canvasLocales?.ar;
  const en = enRaw
    ? mergeCanvasPage(enRaw as CanvasPage)
    : mergeCanvasPage(legacyCanvas);
  const ar = arRaw ? mergeCanvasPage(arRaw as CanvasPage) : cloneCanvasForLocale(en);
  return { en, ar };
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
  return {
    id: p.id,
    name: typeof p.name === 'string' ? p.name : 'Untitled',
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : nowIso(),
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : nowIso(),
    canvasLocales,
    seo,
  };
}

function newPageDoc(name: string, canvas: CanvasPage = EMPTY_CANVAS_PAGE): LandingPageDocument {
  const merged = mergeCanvasPage(canvas);
  const t = nowIso();
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now()}`,
    name,
    createdAt: t,
    updatedAt: t,
    canvasLocales: { en: merged, ar: cloneCanvasForLocale(merged) },
    seo: mergeLandingPageSeo(undefined, {}),
  };
}

/** English canvas — for lists and thumbnails. */
export function getPageCanvasEn(doc: LandingPageDocument): CanvasPage {
  return doc.canvasLocales.en;
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
    createdAt: t,
    updatedAt: t,
    canvasLocales: {
      en: cloneCanvasForLocale(src.canvasLocales.en),
      ar: cloneCanvasForLocale(src.canvasLocales.ar),
    },
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
        return {
          version: 1,
          pages: parsed.pages.map((p) => normalizePage(p)),
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
