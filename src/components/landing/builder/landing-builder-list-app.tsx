'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { LandingProjectState } from '@/types/landing-project';
import { loadLandingProject, saveLandingProject } from '@/lib/landing-builder/project-storage';
import { ProjectPageList } from './project-page-list';

export function LandingBuilderListApp() {
  const [project, setProject] = useState<LandingProjectState>(() => loadLandingProject());
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'en';

  useEffect(() => {
    const t = window.setTimeout(() => saveLandingProject(project), 450);
    return () => window.clearTimeout(t);
  }, [project]);

  return (
    <ProjectPageList
      project={project}
      onChange={setProject}
      onOpenPage={(slug) =>
        router.push(`/${locale}/landing-builder/edit?slug=${encodeURIComponent(slug)}`)
      }
      onPreviewPage={(slug) => router.push(`/${locale}/landing-builder/${encodeURIComponent(slug)}`)}
    />
  );
}
