'use client';

import { useState } from 'react';
import { FileStack, Plus, Pencil, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { LandingProjectState } from '@/types/landing-project';
import {
  newPageDoc,
  duplicateLandingPage,
  ensureUniqueSlug,
  getPageCanvasEn,
  slugifyName,
} from '@/lib/landing-builder/project-storage';
import { mergeCanvasPage, starterCanvasPage } from '@/lib/landing-builder/canvas-defaults';
import { hasNestedBlockChildren, type CanvasBlock, type CanvasPage } from '@/types/landing-canvas';
import cn from '@/utils/class-names';

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
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('New page');
  const [startMode, setStartMode] = useState<'blank' | 'starter'>('blank');

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
    const canvas =
      startMode === 'blank' ? mergeCanvasPage({}) : mergeCanvasPage(starterCanvasPage());
    const doc = newPageDoc(name, canvas);
    doc.slug = ensureUniqueSlug(slugifyName(name), project.pages);
    onChange({
      ...project,
      pages: [...project.pages, doc],
      activePageId: doc.id,
    });
    setCreating(false);
    setNewName('New page');
    toast.success(`Created “${name}”`);
  };

  const duplicate = (id: string) => {
    const src = project.pages.find((p) => p.id === id);
    if (!src) return;
    const doc = duplicateLandingPage(src, `${src.name} (copy)`);
    doc.slug = ensureUniqueSlug(doc.slug, [...project.pages, doc], doc.id);
    onChange({
      ...project,
      pages: [...project.pages, doc],
      activePageId: doc.id,
    });
    toast.success('Duplicated page');
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

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-br from-zinc-100 via-white to-indigo-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20">
      <header className="border-b border-zinc-200/80 bg-white/80 px-4 py-5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
              <FileStack className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Landing pages
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Build pages from empty sections — drag blocks, edit in one panel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            New page
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8">
        {creating ? (
          <div className="mb-8 rounded-2xl border border-indigo-200/60 bg-white p-6 shadow-lg dark:border-indigo-900/40 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Create page</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium uppercase text-zinc-500">Page name</span>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase text-zinc-500">Start from</span>
                <select
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  value={startMode}
                  onChange={(e) => setStartMode(e.target.value as 'blank' | 'starter')}
                >
                  <option value="blank">Blank — no sections</option>
                  <option value="starter">Starter — one hero section</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addPage}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Create &amp; open
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <ul className="space-y-3">
          {project.pages.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                onClick={() => open(p.id)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span className="truncate font-semibold text-zinc-900 dark:text-white">
                    {p.name}
                  </span>
                </div>
                <p className="mt-1 pl-6 text-xs text-zinc-500">
                  Updated {formatDate(p.updatedAt)} ·{' '}
                  {getPageCanvasEn(p).sections.length} sections · {countBlocks(getPageCanvasEn(p))}{' '}
                  blocks
                </p>
                <p className="mt-0.5 pl-6 text-[11px] font-mono text-zinc-400">
                  /landing-builder/{p.slug}
                </p>
              </button>
              <div className="flex shrink-0 flex-wrap gap-2 pl-6 sm:pl-0">
                <button
                  type="button"
                  onClick={() => open(p.id)}
                  className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => (onPreviewPage ? onPreviewPage(p.slug) : undefined)}
                  className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-600"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => duplicate(p.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium dark:border-zinc-600"
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={project.pages.length <= 1}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-40 dark:border-zinc-600',
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {project.pages.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">No pages — create one to start.</p>
        ) : null}
      </main>
    </div>
  );
}
