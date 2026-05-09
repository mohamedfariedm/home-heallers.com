'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { LandingProjectState } from '@/types/landing-project';
import { loadLandingProject, saveLandingProject } from '@/lib/landing-builder/project-storage';
import { LandingEditorWorkspace } from './landing-editor-workspace';

export function LandingBuilderEditorApp() {
  const [project, setProject] = useState<LandingProjectState>(() => loadLandingProject());
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'en';
  const slug = searchParams.get('slug');

  useEffect(() => {
    const t = window.setTimeout(() => saveLandingProject(project), 450);
    return () => window.clearTimeout(t);
  }, [project]);

  const activePage = useMemo(() => {
    if (slug) return project.pages.find((p) => p.slug === slug) ?? null;
    if (project.activePageId) return project.pages.find((p) => p.id === project.activePageId) ?? null;
    return project.pages[0] ?? null;
  }, [project.pages, project.activePageId, slug]);

  if (!activePage) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Page not found.</p>
          <Link
            href={`/${locale}/landing-builder`}
            className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to landing pages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <LandingEditorWorkspace
      key={activePage.id}
      page={activePage}
      setProject={setProject}
      onExit={() => router.push(`/${locale}/landing-builder`)}
    />
  );
}
