'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Moon,
  Sun,
  Undo2,
  Redo2,
  Code2,
  Download,
  Copy,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  Sparkles,
  Layers,
  SlidersHorizontal,
  X,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CanvasPage } from '@/types/landing-canvas';
import type { LandingProjectState, LandingPageDocument, LandingLocale } from '@/types/landing-project';
import { mergeLandingPageSeo, type LandingPageSeo } from '@/types/landing-seo';
import {
  defaultSection,
  mergeCanvasPage,
  starterCanvasPage,
} from '@/lib/landing-builder/canvas-defaults';
import { addSection, insertSectionAfter } from '@/lib/landing-builder/canvas-mutators';
import { CanvasPagePreview } from '@/components/landing/canvas/canvas-page-preview';
import { CanvasQuickEditBar } from './canvas-quick-edit-bar';
import { CanvasLayersPanel } from './canvas-layers-panel';
import { CanvasInspector } from './canvas-inspector';
import { findBlock, findSection } from '@/lib/landing-builder/canvas-query';
import {
  LandingEditorCanvasProvider,
  useLandingEditorCanvas,
} from '@/components/landing/builder/landing-editor-canvas-context';
import { LandingSeoPanel } from '@/components/landing/builder/landing-seo-panel';
import cn from '@/utils/class-names';

type Props = {
  page: LandingPageDocument;
  setProject: React.Dispatch<React.SetStateAction<LandingProjectState>>;
};

function flushCanvasLocales(
  prev: LandingProjectState,
  pageId: string,
  locale: LandingLocale,
  canvas: CanvasPage,
): LandingProjectState {
  return {
    ...prev,
    pages: prev.pages.map((p) =>
      p.id === pageId
        ? {
            ...p,
            canvasLocales: { ...p.canvasLocales, [locale]: canvas },
            updatedAt: new Date().toISOString(),
          }
        : p,
    ),
  };
}

type InnerProps = Props & {
  editingLocale: LandingLocale;
  setEditingLocale: React.Dispatch<React.SetStateAction<LandingLocale>>;
  seoDraft: LandingPageSeo;
  setSeoDraft: React.Dispatch<React.SetStateAction<LandingPageSeo>>;
  openPanel: 'layers' | 'props' | 'json' | 'seo' | null;
  setOpenPanel: React.Dispatch<React.SetStateAction<'layers' | 'props' | 'json' | 'seo' | null>>;
  previewDark: boolean;
  setPreviewDark: React.Dispatch<React.SetStateAction<boolean>>;
  previewViewport: 'desktop' | 'tablet' | 'mobile';
  setPreviewViewport: React.Dispatch<React.SetStateAction<'desktop' | 'tablet' | 'mobile'>>;
  pageTitle: string;
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
  commitTitle: () => void;
  flushCanvasToProject: (pageId: string, locale: LandingLocale, canvas: CanvasPage) => void;
};

function LandingEditorWorkspaceInner({
  page,
  setProject,
  editingLocale,
  setEditingLocale,
  seoDraft,
  setSeoDraft,
  openPanel,
  setOpenPanel,
  previewDark,
  setPreviewDark,
  previewViewport,
  setPreviewViewport,
  pageTitle,
  setPageTitle,
  commitTitle,
  flushCanvasToProject,
}: InnerProps) {
  const { canvas, setCanvas, hydrate, undo, redo, canUndo, canRedo } = useLandingEditorCanvas();

  const mirrorSectionStructure = useCallback(
    (mutator: (c: CanvasPage) => CanvasPage) => {
      let nextActive: CanvasPage | null = null;
      setProject((prev) => {
        const p = prev.pages.find((x) => x.id === page.id);
        if (!p) return prev;
        const nextEn = mergeCanvasPage(mutator(mergeCanvasPage(p.canvasLocales.en)));
        const nextAr = mergeCanvasPage(mutator(mergeCanvasPage(p.canvasLocales.ar)));
        nextActive = editingLocale === 'en' ? nextEn : nextAr;
        return {
          ...prev,
          pages: prev.pages.map((x) =>
            x.id === page.id
              ? {
                  ...x,
                  canvasLocales: { en: nextEn, ar: nextAr },
                  updatedAt: new Date().toISOString(),
                }
              : x,
          ),
        };
      });
      if (nextActive) {
        hydrate(mergeCanvasPage(nextActive));
      }
    },
    [page.id, editingLocale, setProject, hydrate],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pendingScrollToId = useRef<string | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (selectedId === null) return;
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (previewSurfaceRef.current?.contains(t)) return;
      if (t.closest('[data-lp-quick-edit]')) return;
      if (t.closest('[role="dialog"]')) return;
      if (t.closest('[aria-label="Editor panels"]')) return;
      if (t.closest('header')) return;
      setSelectedId(null);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [selectedId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (openPanel) {
        setOpenPanel(null);
        e.preventDefault();
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openPanel, setOpenPanel]);

  useEffect(() => {
    if (!selectedId) return;
    if (findSection(canvas, selectedId) || findBlock(canvas, selectedId)) return;
    setSelectedId(null);
  }, [canvas, selectedId]);

  useLayoutEffect(() => {
    const pending = pendingScrollToId.current;
    if (!pending || pending !== selectedId) {
      if (pending && pending !== selectedId) pendingScrollToId.current = null;
      return;
    }
    pendingScrollToId.current = null;
    const root = previewScrollRef.current;
    if (!root) return;
    root
      .querySelector(`[data-lp-canvas="${pending}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId, canvas]);

  const applyStarter = () => {
    mirrorSectionStructure(() => starterCanvasPage());
    toast.success('Starter layout loaded for English and Arabic');
  };

  const copyJson = async () => {
    const text = JSON.stringify(canvas, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Canvas JSON copied (${editingLocale.toUpperCase()})`);
    } catch {
      toast.error('Clipboard not available');
    }
  };

  const exportZip = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const other: LandingLocale = editingLocale === 'en' ? 'ar' : 'en';
      const enCanvas = editingLocale === 'en' ? canvas : page.canvasLocales.en;
      const arCanvas = editingLocale === 'ar' ? canvas : page.canvasLocales.ar;
      zip.file('canvas-en.json', JSON.stringify(mergeCanvasPage(enCanvas), null, 2));
      zip.file('canvas-ar.json', JSON.stringify(mergeCanvasPage(arCanvas), null, 2));
      zip.file('seo.json', JSON.stringify(mergeLandingPageSeo(page.seo, seoDraft), null, 2));
      zip.file(
        'README.md',
        `# Landing export\n\n- canvas-en.json / canvas-ar.json — bilingual builder canvases.\n- seo.json — meta / Open Graph / hreflang fields.\n- Schema: src/types/landing-canvas.ts, landing-seo.ts\n\nNote: Unsaved edits in the other locale (${other}) use the last saved file from the editor.\n`,
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'landing-export.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ZIP downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const [jsonText, setJsonText] = useState('');
  useEffect(() => {
    if (openPanel === 'json') setJsonText(JSON.stringify(canvas, null, 2));
  }, [canvas, openPanel]);

  const togglePanel = (id: 'layers' | 'props' | 'json' | 'seo') => {
    setOpenPanel((cur) => (cur === id ? null : id));
  };

  const backToList = () => {
    flushCanvasToProject(page.id, editingLocale, canvas);
    setProject((prev) => ({ ...prev, activePageId: null }));
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-zinc-200 bg-white/90 px-3 py-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={backToList}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">All pages</span>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[220px]">
          <input
            className="min-w-0 flex-1 truncate rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            title="Page name"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <div
            className="flex items-center rounded-xl border border-zinc-200 p-0.5 dark:border-zinc-700"
            title="Edit canvas for each language"
          >
            {(['en', 'ar'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setEditingLocale(loc)}
                className={cn(
                  'rounded-lg px-2 py-1 text-[11px] font-bold tracking-wide text-zinc-500 transition dark:text-zinc-400',
                  editingLocale === loc &&
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
                )}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={applyStarter}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 sm:px-3 sm:text-sm"
            title="Load a simple starter layout"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Starter</span>
          </button>

          <div className="hidden items-center rounded-xl border border-zinc-200 p-0.5 dark:border-zinc-700 sm:flex">
            {(
              [
                ['desktop', Monitor, 'Full width'],
                ['tablet', Tablet, 'Tablet ~834px'],
                ['mobile', Smartphone, 'Phone ~390px'],
              ] as const
            ).map(([key, Icon, title]) => (
              <button
                key={key}
                type="button"
                title={title}
                onClick={() => setPreviewViewport(key)}
                className={cn(
                  'rounded-lg p-1.5 text-zinc-500 transition dark:text-zinc-400',
                  previewViewport === key &&
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPreviewDark((d) => !d)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300 sm:px-3 sm:text-sm"
            title="Preview appearance"
          >
            {previewDark ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{previewDark ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            className="rounded-xl border border-zinc-200 p-1.5 text-zinc-600 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
            className="rounded-xl border border-zinc-200 p-1.5 text-zinc-600 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={copyJson}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 sm:gap-1.5 sm:px-3 sm:text-sm"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy JSON
          </button>
          <button
            type="button"
            onClick={exportZip}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-1.5 text-xs font-semibold text-white shadow-md sm:gap-1.5 sm:px-3 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5" />
            ZIP
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <nav
          className="flex w-[52px] shrink-0 flex-col items-center gap-1 border-r border-zinc-200 bg-white py-2 dark:border-zinc-800 dark:bg-zinc-900"
          aria-label="Editor panels"
        >
          <button
            type="button"
            title="Layers"
            aria-label="Layers"
            aria-pressed={openPanel === 'layers'}
            onClick={() => togglePanel('layers')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition dark:text-zinc-400',
              openPanel === 'layers'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            )}
          >
            <Layers className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title="Properties"
            aria-label="Properties"
            aria-pressed={openPanel === 'props'}
            onClick={() => togglePanel('props')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition dark:text-zinc-400',
              openPanel === 'props'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            )}
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title="JSON"
            aria-label="JSON"
            aria-pressed={openPanel === 'json'}
            onClick={() => togglePanel('json')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition dark:text-zinc-400',
              openPanel === 'json'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            )}
          >
            <Code2 className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title="SEO"
            aria-label="SEO"
            aria-pressed={openPanel === 'seo'}
            onClick={() => togglePanel('seo')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition dark:text-zinc-400',
              openPanel === 'seo'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            )}
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </nav>

        {openPanel ? (
          <button
            type="button"
            aria-label="Close panel"
            className="absolute inset-0 left-[52px] z-[100] bg-zinc-950/40 backdrop-blur-[1px] dark:bg-black/50"
            onClick={() => setOpenPanel(null)}
          />
        ) : null}

        {openPanel ? (
          <aside
            className="absolute inset-y-0 left-[52px] z-[110] flex w-[min(100%,440px)] max-w-[calc(100vw-52px)] flex-col border-r border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:w-[min(100%,480px)]"
            role="dialog"
            aria-modal="true"
            aria-label={
              openPanel === 'layers'
                ? 'Layers'
                : openPanel === 'props'
                  ? 'Properties'
                  : openPanel === 'json'
                    ? 'JSON'
                    : 'SEO'
            }
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {openPanel === 'layers' && 'Layers'}
                {openPanel === 'props' && 'Properties'}
                {openPanel === 'json' && `JSON (${editingLocale.toUpperCase()} canvas)`}
                {openPanel === 'seo' && 'SEO'}
              </span>
              <button
                type="button"
                title="Close"
                aria-label="Close panel"
                onClick={() => setOpenPanel(null)}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              {openPanel === 'layers' ? (
                <CanvasLayersPanel
                  canvas={canvas}
                  onChange={setCanvas}
                  onMirrorSectionStructure={mirrorSectionStructure}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ) : null}
              {openPanel === 'props' ? (
                <CanvasInspector
                  canvas={canvas}
                  selectedId={selectedId}
                  onChange={setCanvas}
                  onMirrorSectionStructure={mirrorSectionStructure}
                />
              ) : null}
              {openPanel === 'json' ? (
                <div className="space-y-3">
                  <textarea
                    className="h-[min(65dvh,480px)] w-full rounded-xl border border-zinc-200 bg-zinc-950/5 p-3 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="w-full rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(jsonText) as unknown;
                        setCanvas(mergeCanvasPage(parsed as typeof canvas));
                        toast.success(`Canvas applied (${editingLocale.toUpperCase()})`);
                      } catch {
                        toast.error('Invalid JSON');
                      }
                    }}
                  >
                    Apply JSON
                  </button>
                </div>
              ) : null}
              {openPanel === 'seo' ? (
                <LandingSeoPanel seo={seoDraft} onChange={setSeoDraft} />
              ) : null}
            </div>
          </aside>
        ) : null}

        <main className="relative z-0 min-h-0 min-w-0 flex-1 overflow-y-auto bg-zinc-200/80 p-3 dark:bg-zinc-950 sm:p-4">
          <div
            className={cn(
              'mx-auto w-full transition-[max-width] duration-300 ease-out',
              previewViewport === 'mobile' && 'max-w-[400px]',
              previewViewport === 'tablet' && 'max-w-[848px]',
              previewViewport === 'desktop' && 'max-w-6xl',
            )}
          >
            <div
              ref={previewSurfaceRef}
              className={cn(
                'overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/10',
                previewViewport !== 'desktop' &&
                  'shadow-2xl ring-4 ring-zinc-300/90 dark:ring-zinc-700',
              )}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {`Preview (${editingLocale.toUpperCase()}${editingLocale === 'ar' ? ', RTL' : ''})`}{' '}
                  — click outside frame or Esc to clear selection
                </span>
                <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {previewViewport === 'mobile' && '390px'}
                  {previewViewport === 'tablet' && '834px'}
                  {previewViewport === 'desktop' && 'Fluid'}
                </span>
              </div>
              <div
                ref={previewScrollRef}
                className="max-h-[calc(100dvh-8rem)] overflow-y-auto overflow-x-hidden sm:max-h-[calc(100dvh-5.5rem)]"
              >
                <CanvasPagePreview
                  canvas={canvas}
                  previewDark={previewDark}
                  previewDir={editingLocale === 'ar' ? 'rtl' : 'ltr'}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  editable
                  onAppendSection={() => {
                    const section = defaultSection(
                      `Section ${canvas.sections.length + 1}`,
                    );
                    mirrorSectionStructure((c) => addSection(c, section));
                    setSelectedId(section.id);
                    pendingScrollToId.current = section.id;
                  }}
                  onInsertSectionAfter={(sectionId) => {
                    const section = defaultSection(
                      `Section ${canvas.sections.length + 1}`,
                    );
                    mirrorSectionStructure((c) => insertSectionAfter(c, sectionId, section));
                    setSelectedId(section.id);
                    pendingScrollToId.current = section.id;
                  }}
                />
              </div>
            </div>
          </div>
          <CanvasQuickEditBar
            canvas={canvas}
            selectedId={selectedId}
            onChange={setCanvas}
            onSelect={setSelectedId}
          />
        </main>
      </div>
    </div>
  );
}

export function LandingEditorWorkspace({ page, setProject }: Props) {
  const [editingLocale, setEditingLocale] = useState<LandingLocale>('en');
  const [seoDraft, setSeoDraft] = useState<LandingPageSeo>(() => mergeLandingPageSeo(undefined, page.seo));
  const [openPanel, setOpenPanel] = useState<'layers' | 'props' | 'json' | 'seo' | null>(null);
  const [previewDark, setPreviewDark] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop',
  );
  const [pageTitle, setPageTitle] = useState(page.name);

  useEffect(() => {
    setPageTitle(page.name);
  }, [page.id, page.name]);

  useEffect(() => {
    setSeoDraft(mergeLandingPageSeo(undefined, page.seo));
    // Intentionally only when switching pages — avoid resetting SEO while typing after save.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- page.seo updates from our debounced persist
  }, [page.id]);

  const commitTitle = () => {
    const name = pageTitle.trim() || 'Untitled';
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === page.id ? { ...p, name } : p)),
    }));
  };

  const flushCanvasToProject = useCallback(
    (pageId: string, locale: LandingLocale, c: Parameters<typeof mergeCanvasPage>[0]) => {
      const merged = mergeCanvasPage(c);
      setProject((prev) => flushCanvasLocales(prev, pageId, locale, merged));
    },
    [setProject],
  );

  const persistSeo = useCallback(
    (seo: LandingPageSeo) => {
      setProject((prev) => ({
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === page.id
            ? {
                ...p,
                seo: mergeLandingPageSeo(p.seo, seo),
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      }));
    },
    [page.id, setProject],
  );

  useEffect(() => {
    const mergedPageSeo = mergeLandingPageSeo(undefined, page.seo);
    if (JSON.stringify(seoDraft) === JSON.stringify(mergedPageSeo)) return;
    const t = window.setTimeout(() => persistSeo(seoDraft), 500);
    return () => window.clearTimeout(t);
  }, [seoDraft, page.seo, page.id, persistSeo]);

  return (
    <LandingEditorCanvasProvider
      key={`${page.id}-${editingLocale}`}
      pageId={page.id}
      locale={editingLocale}
      seed={mergeCanvasPage(page.canvasLocales[editingLocale])}
      onUnmountPersist={flushCanvasToProject}
      onDebouncedPersist={flushCanvasToProject}
    >
      <LandingEditorWorkspaceInner
        page={page}
        setProject={setProject}
        editingLocale={editingLocale}
        setEditingLocale={setEditingLocale}
        seoDraft={seoDraft}
        setSeoDraft={setSeoDraft}
        openPanel={openPanel}
        setOpenPanel={setOpenPanel}
        previewDark={previewDark}
        setPreviewDark={setPreviewDark}
        previewViewport={previewViewport}
        setPreviewViewport={setPreviewViewport}
        pageTitle={pageTitle}
        setPageTitle={setPageTitle}
        commitTitle={commitTitle}
        flushCanvasToProject={flushCanvasToProject}
      />
    </LandingEditorCanvasProvider>
  );
}
