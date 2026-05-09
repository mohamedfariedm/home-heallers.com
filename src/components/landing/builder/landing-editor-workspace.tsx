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
import type { CanvasBlock, CanvasPage } from '@/types/landing-canvas';
import type {
  LandingProjectState,
  LandingPageDocument,
  LandingLocale,
  LandingLocaleConfig,
} from '@/types/landing-project';
import { mergeLandingPageSeo, type LandingPageSeo } from '@/types/landing-seo';
import {
  defaultFormBlock,
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
  onExit?: () => void;
};

function flushCanvasLocales(
  prev: LandingProjectState,
  pageId: string,
  locale: LandingLocale,
  canvas: CanvasPage,
): LandingProjectState {
  const syncBlockContentWithPrimary = (
    target: CanvasBlock,
    oldPrimary: CanvasBlock | undefined,
    newPrimary: CanvasBlock | undefined,
  ): CanvasBlock => {
    let next = target;
    if (oldPrimary && newPrimary && oldPrimary.type === target.type && newPrimary.type === target.type) {
      if (target.type === 'text') {
        const oldText = oldPrimary as Extract<CanvasBlock, { type: 'text' }>;
        const newText = newPrimary as Extract<CanvasBlock, { type: 'text' }>;
        if (target.content === oldText.content) next = { ...target, content: newText.content };
      } else if (target.type === 'copy') {
        const oldCopy = oldPrimary as Extract<CanvasBlock, { type: 'copy' }>;
        const newCopy = newPrimary as Extract<CanvasBlock, { type: 'copy' }>;
        next = {
          ...target,
          eyebrow: target.eyebrow === oldCopy.eyebrow ? newCopy.eyebrow : target.eyebrow,
          headline: target.headline === oldCopy.headline ? newCopy.headline : target.headline,
          subheadline:
            target.subheadline === oldCopy.subheadline ? newCopy.subheadline : target.subheadline,
          body: target.body === oldCopy.body ? newCopy.body : target.body,
        };
      } else if (target.type === 'button') {
        const oldButton = oldPrimary as Extract<CanvasBlock, { type: 'button' }>;
        const newButton = newPrimary as Extract<CanvasBlock, { type: 'button' }>;
        if (target.label === oldButton.label) next = { ...target, label: newButton.label };
      } else if (target.type === 'form') {
        const oldForm = oldPrimary as Extract<CanvasBlock, { type: 'form' }>;
        const newForm = newPrimary as Extract<CanvasBlock, { type: 'form' }>;
        next = {
          ...target,
          title: target.title === oldForm.title ? newForm.title : target.title,
          description:
            target.description === oldForm.description ? newForm.description : target.description,
          submitLabel:
            target.submitLabel === oldForm.submitLabel ? newForm.submitLabel : target.submitLabel,
          successMessage:
            target.successMessage === oldForm.successMessage
              ? newForm.successMessage
              : target.successMessage,
          fields: target.fields.map((field, i) => {
            const oldField = oldForm.fields[i];
            const newField = newForm.fields[i];
            if (!oldField || !newField) return field;
            return {
              ...field,
              label: field.label === oldField.label ? newField.label : field.label,
              placeholder:
                field.placeholder === oldField.placeholder ? newField.placeholder : field.placeholder,
            };
          }),
        };
      } else if (target.type === 'navbar') {
        const oldNavbar = oldPrimary as Extract<CanvasBlock, { type: 'navbar' }>;
        const newNavbar = newPrimary as Extract<CanvasBlock, { type: 'navbar' }>;
        next = {
          ...target,
          logoText: target.logoText === oldNavbar.logoText ? newNavbar.logoText : target.logoText,
          ctaLabel: target.ctaLabel === oldNavbar.ctaLabel ? newNavbar.ctaLabel : target.ctaLabel,
          links: target.links.map((link, i) => {
            const oldLink = oldNavbar.links[i];
            const newLink = newNavbar.links[i];
            if (!oldLink || !newLink) return link;
            return {
              ...link,
              label: link.label === oldLink.label ? newLink.label : link.label,
            };
          }),
        };
      } else if (target.type === 'footer') {
        const oldFooter = oldPrimary as Extract<CanvasBlock, { type: 'footer' }>;
        const newFooter = newPrimary as Extract<CanvasBlock, { type: 'footer' }>;
        next = {
          ...target,
          copyright:
            target.copyright === oldFooter.copyright ? newFooter.copyright : target.copyright,
          tagline: target.tagline === oldFooter.tagline ? newFooter.tagline : target.tagline,
          columns: target.columns.map((col, i) => {
            const oldCol = oldFooter.columns[i];
            const newCol = newFooter.columns[i];
            if (!oldCol || !newCol) return col;
            return {
              ...col,
              title: col.title === oldCol.title ? newCol.title : col.title,
              links: col.links.map((l, linkIndex) => {
                const oldLink = oldCol.links[linkIndex];
                const newLink = newCol.links[linkIndex];
                if (!oldLink || !newLink) return l;
                return { ...l, label: l.label === oldLink.label ? newLink.label : l.label };
              }),
            };
          }),
        };
      } else if (target.type === 'card') {
        const oldCard = oldPrimary as Extract<CanvasBlock, { type: 'card' }>;
        const newCard = newPrimary as Extract<CanvasBlock, { type: 'card' }>;
        next = {
          ...target,
          title: target.title === oldCard.title ? newCard.title : target.title,
          body: target.body === oldCard.body ? newCard.body : target.body,
          ctaLabel: target.ctaLabel === oldCard.ctaLabel ? newCard.ctaLabel : target.ctaLabel,
        };
      }
    }

    if (next.type === 'stack' || next.type === 'grid') {
      const oldChildren =
        oldPrimary && (oldPrimary.type === 'stack' || oldPrimary.type === 'grid') ? oldPrimary.children : [];
      const newChildren =
        newPrimary && (newPrimary.type === 'stack' || newPrimary.type === 'grid') ? newPrimary.children : [];
      return {
        ...next,
        children: next.children.map((child) =>
          syncBlockContentWithPrimary(
            child,
            oldChildren.find((x) => x.id === child.id),
            newChildren.find((x) => x.id === child.id),
          ),
        ),
      };
    }
    return next;
  };

  const syncLocaleWithPrimaryFallback = (
    targetCanvas: CanvasPage,
    oldPrimaryCanvas: CanvasPage,
    newPrimaryCanvas: CanvasPage,
  ): CanvasPage => {
    const oldSections = new Map(oldPrimaryCanvas.sections.map((s) => [s.id, s]));
    const newSections = new Map(newPrimaryCanvas.sections.map((s) => [s.id, s]));
    return {
      ...targetCanvas,
      siteName:
        targetCanvas.siteName === oldPrimaryCanvas.siteName
          ? newPrimaryCanvas.siteName
          : targetCanvas.siteName,
      sections: targetCanvas.sections.map((section) => {
        const oldSection = oldSections.get(section.id);
        const newSection = newSections.get(section.id);
        return {
          ...section,
          name:
            oldSection && newSection && section.name === oldSection.name ? newSection.name : section.name,
          children: section.children.map((child) =>
            syncBlockContentWithPrimary(
              child,
              oldSection?.children.find((x) => x.id === child.id),
              newSection?.children.find((x) => x.id === child.id),
            ),
          ),
        };
      }),
    };
  };

  return {
    ...prev,
    pages: prev.pages.map((p) =>
      p.id === pageId
        ? (() => {
            const primary = p.locales[0]?.code ?? 'en';
            const oldPrimaryCanvas =
              p.canvasLocales[primary] ?? p.canvasLocales[locale] ?? mergeCanvasPage({});
            const nextCanvasLocales = { ...p.canvasLocales, [locale]: canvas };
            if (locale === primary) {
              for (const loc of p.locales) {
                if (loc.code === primary) continue;
                const currentLocaleCanvas = nextCanvasLocales[loc.code];
                if (!currentLocaleCanvas) continue;
                nextCanvasLocales[loc.code] = syncLocaleWithPrimaryFallback(
                  currentLocaleCanvas,
                  oldPrimaryCanvas,
                  canvas,
                );
              }
            }
            return {
              ...p,
              canvasLocales: nextCanvasLocales,
              updatedAt: new Date().toISOString(),
            };
          })()
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

const LANGUAGE_PRESETS: LandingLocaleConfig[] = [
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', label: 'Arabic', dir: 'rtl', flag: '🇸🇦' },
  { code: 'fr', label: 'French', dir: 'ltr', flag: '🇫🇷' },
  { code: 'es', label: 'Spanish', dir: 'ltr', flag: '🇪🇸' },
  { code: 'de', label: 'German', dir: 'ltr', flag: '🇩🇪' },
  { code: 'it', label: 'Italian', dir: 'ltr', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', dir: 'ltr', flag: '🇵🇹' },
  { code: 'tr', label: 'Turkish', dir: 'ltr', flag: '🇹🇷' },
  { code: 'ru', label: 'Russian', dir: 'ltr', flag: '🇷🇺' },
  { code: 'ur', label: 'Urdu', dir: 'rtl', flag: '🇵🇰' },
  { code: 'fa', label: 'Persian', dir: 'rtl', flag: '🇮🇷' },
  { code: 'he', label: 'Hebrew', dir: 'rtl', flag: '🇮🇱' },
];

function localeFlag(loc: LandingLocaleConfig): string {
  return loc.flag ?? LANGUAGE_PRESETS.find((x) => x.code === loc.code)?.flag ?? '🏳️';
}

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
  onExit,
}: InnerProps) {
  const { canvas, setCanvas, hydrate, undo, redo, canUndo, canRedo } = useLandingEditorCanvas();

  const pageLocales = page.locales.length
    ? page.locales
    : ([{ code: 'en', label: 'English', dir: 'ltr' }] as LandingLocaleConfig[]);
  const addableLocales = LANGUAGE_PRESETS.filter((preset) => !pageLocales.some((l) => l.code === preset.code));
  const [selectedPresetCode, setSelectedPresetCode] = useState<string>(addableLocales[0]?.code ?? 'ar');

  useEffect(() => {
    if (!addableLocales.some((x) => x.code === selectedPresetCode)) {
      setSelectedPresetCode(addableLocales[0]?.code ?? '');
    }
  }, [addableLocales, selectedPresetCode]);

  const addLocale = () => {
    const picked = LANGUAGE_PRESETS.find((x) => x.code === selectedPresetCode);
    if (!picked) {
      toast.error('Choose a language');
      return;
    }
    if (pageLocales.some((l) => l.code === picked.code)) {
      toast.error('Language already exists');
      return;
    }
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== page.id) return p;
        const source = p.canvasLocales[editingLocale] ?? p.canvasLocales[p.locales[0]?.code ?? 'en'];
        return {
          ...p,
          locales: [...p.locales, picked],
          canvasLocales: {
            ...p.canvasLocales,
            [picked.code]: mergeCanvasPage(source),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    setEditingLocale(picked.code);
    toast.success(`${localeFlag(picked)} ${picked.label} added`);
  };

  const removeLocale = (code: string) => {
    if (pageLocales.length <= 1) {
      toast.error('Keep at least one locale');
      return;
    }
    setProject((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        if (p.id !== page.id) return p;
        const nextLocales = p.locales.filter((l) => l.code !== code);
        const nextCanvasLocales = { ...p.canvasLocales };
        delete nextCanvasLocales[code];
        return {
          ...p,
          locales: nextLocales,
          canvasLocales: nextCanvasLocales,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    if (editingLocale === code) setEditingLocale(pageLocales.find((l) => l.code !== code)?.code ?? 'en');
    const removed = pageLocales.find((l) => l.code === code);
    toast.success(`${removed ? `${localeFlag(removed)} ${removed.label}` : code.toUpperCase()} removed`);
  };

  const mirrorSectionStructure = useCallback(
    (mutator: (c: CanvasPage) => CanvasPage) => {
      // Apply immediately to the active editor canvas to avoid one-click lag.
      const nextLocal = mergeCanvasPage(mutator(canvas));
      hydrate(nextLocal);

      setProject((prev) => {
        const p = prev.pages.find((x) => x.id === page.id);
        if (!p) return prev;
        const nextCanvasLocales = p.locales.reduce<Record<string, CanvasPage>>((acc, loc, i) => {
          const primary = p.locales[0]?.code ?? 'en';
          const source = p.canvasLocales[loc.code] ?? p.canvasLocales[primary];
          acc[loc.code] = mergeCanvasPage(mutator(mergeCanvasPage(source)));
          if (i === 0 && !acc[primary]) {
            acc[primary] = acc[loc.code];
          }
          return acc;
        }, {});
        return {
          ...prev,
          pages: prev.pages.map((x) =>
            x.id === page.id
              ? {
                  ...x,
                  canvasLocales: nextCanvasLocales,
                  updatedAt: new Date().toISOString(),
                }
              : x,
          ),
        };
      });
    },
    [canvas, page.id, setProject, hydrate],
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
    toast.success('Starter layout loaded for all locales');
  };

  const applyLeadTemplate = () => {
    mirrorSectionStructure((current) => {
      const next = starterCanvasPage();
      const formSection = defaultSection('Lead capture');
      formSection.contentAlign = 'center';
      formSection.children = [defaultFormBlock()];
      return { ...next, siteName: current.siteName || 'Landing', sections: [...next.sections, formSection] };
    });
    toast.success('Lead generation template loaded');
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
      for (const loc of pageLocales) {
        const localeCanvas =
          loc.code === editingLocale
            ? canvas
            : (page.canvasLocales[loc.code] ?? page.canvasLocales[pageLocales[0].code]);
        zip.file(`canvas-${loc.code}.json`, JSON.stringify(mergeCanvasPage(localeCanvas), null, 2));
      }
      zip.file('seo.json', JSON.stringify(mergeLandingPageSeo(page.seo, seoDraft), null, 2));
      zip.file(
        'README.md',
        `# Landing export\n\n- canvas-<locale>.json — one file per configured language.\n- seo.json — meta / Open Graph / hreflang fields.\n- Schema: src/types/landing-canvas.ts, landing-seo.ts\n`,
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
    if (onExit) {
      onExit();
      return;
    }
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
            className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
            title="Edit canvas for each language"
          >
            {pageLocales.map((loc) => (
              <button
                key={loc.code}
                type="button"
                onClick={() => setEditingLocale(loc.code)}
                className={cn(
                  'rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 transition dark:text-zinc-300',
                  editingLocale === loc.code &&
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
                )}
                title={loc.label}
              >
                <span className="mr-1">{localeFlag(loc)}</span>
                {loc.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
            <select
              value={selectedPresetCode}
              onChange={(e) => setSelectedPresetCode(e.target.value)}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              disabled={addableLocales.length === 0}
            >
              {addableLocales.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {`${localeFlag(lang)} ${lang.label}`}
                </option>
              ))}
              {addableLocales.length === 0 ? <option value="">All preset languages added</option> : null}
            </select>
            <button
              type="button"
              onClick={addLocale}
              className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
              disabled={addableLocales.length === 0}
            >
              + Language
            </button>
            <button
              type="button"
              onClick={() => removeLocale(editingLocale)}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-700"
              title="Remove current language"
            >
              - Current
            </button>
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
          <button
            type="button"
            onClick={applyLeadTemplate}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200 sm:px-3 sm:text-sm"
            title="Load starter plus lead form section"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lead form</span>
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
                  {`Preview (${editingLocale.toUpperCase()}${pageLocales.find((x) => x.code === editingLocale)?.dir === 'rtl' ? ', RTL' : ''})`}{' '}
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
                  previewDir={pageLocales.find((x) => x.code === editingLocale)?.dir === 'rtl' ? 'rtl' : 'ltr'}
                  availableLocales={pageLocales}
                  currentLocale={editingLocale}
                  onLocaleChange={setEditingLocale}
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

export function LandingEditorWorkspace({ page, setProject, onExit }: Props) {
  const [editingLocale, setEditingLocale] = useState<LandingLocale>(
    page.locales[0]?.code ?? 'en',
  );
  const [seoDraft, setSeoDraft] = useState<LandingPageSeo>(() => mergeLandingPageSeo(undefined, page.seo));
  const [openPanel, setOpenPanel] = useState<'layers' | 'props' | 'json' | 'seo' | null>(null);
  const [previewDark, setPreviewDark] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop',
  );
  const [pageTitle, setPageTitle] = useState(page.name);

  useEffect(() => {
    const currentExists = page.locales.some((l) => l.code === editingLocale);
    if (!currentExists) setEditingLocale(page.locales[0]?.code ?? 'en');
  }, [editingLocale, page.locales]);

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
      seed={mergeCanvasPage(
        page.canvasLocales[editingLocale] ?? page.canvasLocales[page.locales[0]?.code ?? 'en'],
      )}
      onUnmountPersist={flushCanvasToProject}
      onDebouncedPersist={flushCanvasToProject}
    >
      <LandingEditorWorkspaceInner
        page={page}
        setProject={setProject}
        onExit={onExit}
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
