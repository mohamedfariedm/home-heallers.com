'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  FileStack,
  Layers,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { LandingProjectState } from '@/types/landing-project';
import {
  newPageDoc,
  duplicateLandingPage,
  ensureUniqueSlug,
  getPageCanvasEn,
  slugifyName,
  saveLandingProject,
} from '@/lib/landing-builder/project-storage';
import {
  getLandingCanvasPageTemplate,
  LANDING_CANVAS_PAGE_TEMPLATE_META,
  type LandingCanvasPageTemplateId,
} from '@/lib/landing-builder/canvas-templates';
import { LANDING_PAGE_TEMPLATE_CATEGORIES } from '@/lib/landing-builder/landing-page-template-categories';
import { hasNestedBlockChildren, type CanvasBlock, type CanvasPage } from '@/types/landing-canvas';
import cn from '@/utils/class-names';
import { LandingBuilderAnimatedBackdrop } from '@/components/landing/builder/landing-builder-animated-backdrop';

type Props = {
  project: LandingProjectState;
  onChange: (next: LandingProjectState) => void;
  onOpenPage?: (slug: string) => void;
  onPreviewPage?: (slug: string) => void;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function countBlocks(canvas: CanvasPage) {
  let n = 0;
  const walk = (blocks: CanvasBlock[]) => {
    for (const b of blocks) {
      n += 1;
      if (hasNestedBlockChildren(b)) walk(b.children);
    }
  };
  for (const s of canvas.sections) walk(s.children);
  return n;
}

export function ProjectPageList({ project, onChange, onOpenPage, onPreviewPage }: Props) {
  const reduceMotion = useReducedMotion();

  const templateListVariants = useMemo(
    () =>
      reduceMotion
        ? { hidden: {}, show: { transition: { staggerChildren: 0 } } }
        : {
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.055, delayChildren: 0.08 },
            },
          },
    [reduceMotion],
  );

  const templateItemVariants = useMemo(
    () =>
      reduceMotion
        ? {
            hidden: {},
            show: { opacity: 1, transition: { duration: 0 } },
          }
        : {
            hidden: { opacity: 0, y: 18, scale: 0.97 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
            },
          },
    [reduceMotion],
  );

  const pageRowVariants = useMemo(
    () =>
      reduceMotion
        ? {
            hidden: {},
            show: { opacity: 1, transition: { duration: 0 } },
          }
        : {
            hidden: { opacity: 0, y: 14 },
            show: (i: number) => ({
              opacity: 1,
              y: 0,
              transition: {
                delay: i * 0.045,
                type: 'spring' as const,
                stiffness: 400,
                damping: 30,
              },
            }),
          },
    [reduceMotion],
  );
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('New page');
  const [pageTemplateId, setPageTemplateId] =
    useState<LandingCanvasPageTemplateId>('blank');
  const [templatePickerStep, setTemplatePickerStep] = useState<
    'category' | 'template'
  >('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const resetCreateModal = useCallback(() => {
    setCreating(false);
    setTemplatePickerStep('category');
    setSelectedCategoryId(null);
    setNewName('New page');
    setPageTemplateId('blank');
  }, []);

  useEffect(() => {
    if (!creating) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resetCreateModal();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [creating, resetCreateModal]);

  const open = (id: string) => {
    const page = project.pages.find((p) => p.id === id);
    if (!page) return;
    if (onOpenPage) {
      onOpenPage(page.slug);
      return;
    }
    onChange({ ...project, activePageId: id });
  };

  const addPage = () => {
    const name = newName.trim() || 'Untitled page';
    const canvas = getLandingCanvasPageTemplate(pageTemplateId);
    const doc = newPageDoc(name, canvas);
    doc.slug = ensureUniqueSlug(slugifyName(name), project.pages);
    const next: LandingProjectState = {
      ...project,
      pages: [...project.pages, doc],
      activePageId: doc.id,
    };
    saveLandingProject(next);
    onChange(next);
    resetCreateModal();
    toast.success(`Created “${name}”`);
    onOpenPage?.(doc.slug);
  };

  const duplicate = (id: string) => {
    const src = project.pages.find((p) => p.id === id);
    if (!src) return;
    const doc = duplicateLandingPage(src, `${src.name} (copy)`);
    doc.slug = ensureUniqueSlug(doc.slug, [...project.pages, doc], doc.id);
    const next: LandingProjectState = {
      ...project,
      pages: [...project.pages, doc],
      activePageId: doc.id,
    };
    saveLandingProject(next);
    onChange(next);
    toast.success('Duplicated page');
    onOpenPage?.(doc.slug);
  };

  const remove = (id: string) => {
    if (project.pages.length <= 1) {
      toast.error('Keep at least one page');
      return;
    }
    if (!confirm('Delete this page? This cannot be undone.')) return;
    const pages = project.pages.filter((p) => p.id !== id);
    onChange({
      ...project,
      pages,
      activePageId: null,
    });
    toast.success('Page deleted');
  };

  const springDialog = reduceMotion
    ? { duration: 0.2 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.85 };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      <LandingBuilderAnimatedBackdrop reducedMotion={!!reduceMotion} />

      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 border-b border-white/60 bg-white/70 px-4 py-6 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/70 sm:px-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-950/80 dark:text-indigo-200"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, ...springDialog }}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
              Builder workspace
            </motion.div>
            <div className="flex items-start gap-4">
              <motion.div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-white/50 dark:ring-zinc-900/50"
                whileHover={reduceMotion ? undefined : { scale: 1.04, rotate: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                <FileStack className="h-7 w-7" strokeWidth={1.75} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                  Landing pages
                </h1>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Start from a polished template or a blank canvas — edit blocks, locales, and SEO
                  in one flow.
                </p>
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={() => {
              setPageTemplateId('blank');
              setNewName(LANDING_CANVAS_PAGE_TEMPLATE_META.blank.suggestedName);
              setTemplatePickerStep('category');
              setSelectedCategoryId(null);
              setCreating(true);
            }}
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 self-start overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 ring-1 ring-white/20 transition-[box-shadow] hover:shadow-indigo-600/35 dark:ring-white/10 lg:self-auto"
            whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <Plus className="relative h-5 w-5" strokeWidth={2.25} />
            <span className="relative">New page</span>
            <ArrowRight className="relative h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
          </motion.button>
        </div>
      </motion.header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-10">
        <AnimatePresence>
          {creating ? (
            <>
              <motion.div
                role="presentation"
                className="fixed inset-0 z-40 cursor-pointer bg-zinc-950/40 backdrop-blur-sm dark:bg-black/55"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.15 : 0.28 }}
                onClick={() => resetCreateModal()}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="create-page-title"
                  className="relative max-h-[min(92dvh,880px)] w-full max-w-7xl overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl shadow-zinc-900/15 ring-1 ring-zinc-200/60 backdrop-blur-2xl dark:border-zinc-700/80 dark:bg-zinc-900/95 dark:ring-zinc-800/80"
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.94, y: 24 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.96, y: 16 }
                  }
                  transition={springDialog}
                >
                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/20 to-transparent blur-2xl dark:from-indigo-500/25" />
                  <div className="relative flex max-h-[inherit] flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800/80 sm:px-8">
                      <div>
                        <h2
                          id="create-page-title"
                          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white"
                        >
                          Create a page
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {templatePickerStep === 'category'
                            ? 'Name your page, choose a category, then pick a template.'
                            : 'Pick a template in this category — you can change everything in the editor.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => resetCreateModal()}
                        className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                      <label className="block max-w-lg">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Page name
                        </span>
                        <input
                          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-inner outline-none ring-zinc-400/0 transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-white dark:focus:border-indigo-400"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          autoFocus
                          placeholder="My landing page"
                        />
                      </label>

                      <div className="mt-8">
                        {templatePickerStep === 'template' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTemplatePickerStep('category');
                              setSelectedCategoryId(null);
                            }}
                            className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            All categories
                          </button>
                        ) : null}
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-500" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {templatePickerStep === 'category'
                              ? 'Category'
                              : 'Template'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {templatePickerStep === 'category'
                            ? 'Choose a group — then you will see matching page templates.'
                            : 'Hover a card for a preview lift — selected template is highlighted.'}
                        </p>

                        <motion.div
                          key={templatePickerStep + (selectedCategoryId ?? '')}
                          className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                          variants={templateListVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {templatePickerStep === 'category'
                            ? LANDING_PAGE_TEMPLATE_CATEGORIES.map((cat) => (
                                <motion.div
                                  key={cat.id}
                                  variants={templateItemVariants}
                                  layout={!reduceMotion}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCategoryId(cat.id);
                                      setTemplatePickerStep('template');
                                      const first = cat.templateIds[0];
                                      setPageTemplateId(first);
                                      setNewName(
                                        LANDING_CANVAS_PAGE_TEMPLATE_META[first]
                                          .suggestedName,
                                      );
                                    }}
                                    className="group flex w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white text-left shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:border-indigo-300/80 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-indigo-500/50"
                                  >
                                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                      <motion.div
                                        className="h-full w-full"
                                        whileHover={
                                          reduceMotion ? undefined : { scale: 1.06 }
                                        }
                                        transition={{
                                          duration: 0.45,
                                          ease: [0.22, 1, 0.36, 1],
                                        }}
                                      >
                                        <Image
                                          src={cat.previewImageUrl}
                                          alt={`${cat.label} category`}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                      </motion.div>
                                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                      <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-800 shadow dark:bg-zinc-900/90 dark:text-zinc-100">
                                        {cat.templateIds.length}{' '}
                                        {cat.templateIds.length === 1
                                          ? 'template'
                                          : 'templates'}
                                      </span>
                                    </div>
                                    <div className="px-4 py-3">
                                      <span className="font-semibold text-zinc-900 dark:text-white">
                                        {cat.label}
                                      </span>
                                      <span className="mt-1 block text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                                        {cat.description}
                                      </span>
                                    </div>
                                  </button>
                                </motion.div>
                              ))
                            : (() => {
                                const cat = LANDING_PAGE_TEMPLATE_CATEGORIES.find(
                                  (c) => c.id === selectedCategoryId,
                                );
                                const ids = cat?.templateIds ?? [];
                                return ids.map((id) => {
                                  const meta = LANDING_CANVAS_PAGE_TEMPLATE_META[id];
                                  const selected = pageTemplateId === id;
                                  return (
                                    <motion.div
                                      key={id}
                                      variants={templateItemVariants}
                                      layout={!reduceMotion}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPageTemplateId(id);
                                          setNewName(meta.suggestedName);
                                        }}
                                        className={cn(
                                          'group flex w-full flex-col overflow-hidden rounded-2xl border text-left shadow-sm transition-[transform,box-shadow,border-color] duration-300',
                                          selected
                                            ? 'border-indigo-500 bg-indigo-50/90 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/25 dark:border-indigo-400 dark:bg-indigo-950/40 dark:ring-indigo-400/30'
                                            : 'border-zinc-200/90 bg-white hover:border-indigo-300/80 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-indigo-500/50',
                                        )}
                                      >
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                          <motion.div
                                            className="h-full w-full"
                                            whileHover={
                                              reduceMotion
                                                ? undefined
                                                : { scale: 1.06 }
                                            }
                                            transition={{
                                              duration: 0.45,
                                              ease: [0.22, 1, 0.36, 1],
                                            }}
                                          >
                                            <Image
                                              src={meta.previewImageUrl}
                                              alt={`${meta.label} template preview`}
                                              fill
                                              className="object-cover"
                                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            />
                                          </motion.div>
                                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                          {selected ? (
                                            <motion.span
                                              layoutId="template-selected-pill"
                                              className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md dark:bg-indigo-500"
                                              initial={
                                                reduceMotion
                                                  ? false
                                                  : { scale: 0.85, opacity: 0 }
                                              }
                                              animate={{ scale: 1, opacity: 1 }}
                                              transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 28,
                                              }}
                                            >
                                              Selected
                                            </motion.span>
                                          ) : null}
                                        </div>
                                        <div className="px-4 py-3">
                                          <span className="font-semibold text-zinc-900 dark:text-white">
                                            {meta.label}
                                          </span>
                                          <span className="mt-1 block text-xs leading-snug text-zinc-500 dark:text-zinc-400">
                                            {meta.description}
                                          </span>
                                        </div>
                                      </button>
                                    </motion.div>
                                  );
                                });
                              })()}
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800/80 sm:px-8">
                      <button
                        type="button"
                        onClick={() => resetCreateModal()}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="button"
                        onClick={addPage}
                        disabled={templatePickerStep === 'category'}
                        title={
                          templatePickerStep === 'category'
                            ? 'Choose a category and a template first'
                            : undefined
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:pointer-events-none disabled:opacity-50"
                        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      >
                        Create &amp; open
                        <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          ) : null}
        </AnimatePresence>

        <motion.ul className="space-y-4">
          {project.pages.map((p, i) => (
            <motion.li
              key={p.id}
              custom={i}
              variants={pageRowVariants}
              initial="hidden"
              animate="show"
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }
              }
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm shadow-zinc-900/5 backdrop-blur-md transition-shadow hover:border-indigo-200/80 hover:shadow-lg hover:shadow-indigo-500/5 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-indigo-500/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                onClick={() => open(p.id)}
                className="min-w-0 flex-1 text-left transition-opacity hover:opacity-90"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-indigo-600 dark:from-indigo-400/20 dark:text-indigo-300">
                    <Pencil className="h-4 w-4" />
                  </span>
                  <span className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {p.name}
                  </span>
                </div>
                <p className="mt-2 pl-11 text-xs text-zinc-500 dark:text-zinc-400">
                  Updated {formatDate(p.updatedAt)} ·{' '}
                  {getPageCanvasEn(p).sections.length} sections ·{' '}
                  {countBlocks(getPageCanvasEn(p))} blocks
                </p>
                <p className="mt-1 pl-11 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                  /landing-builder/{p.slug}
                </p>
              </button>
              <div className="flex shrink-0 flex-wrap gap-2 pl-11 sm:pl-0">
                <motion.button
                  type="button"
                  onClick={() => open(p.id)}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  Open
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => (onPreviewPage ? onPreviewPage(p.slug) : undefined)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30"
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  Preview
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => duplicate(p.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={project.pages.length <= 1}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-600 dark:hover:bg-red-950/30',
                  )}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </motion.button>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {project.pages.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400"
          >
            No pages yet — tap <span className="font-semibold text-indigo-600 dark:text-indigo-400">New page</span>{' '}
            to begin.
          </motion.p>
        ) : null}
      </main>
    </div>
  );
}
