'use client';

import { useEffect, useState } from 'react';
import type { LandingProjectState } from '@/types/landing-project';
import {
  loadLandingProject,
  saveLandingProject,
} from '@/lib/landing-builder/project-storage';
import { ProjectPageList } from './project-page-list';
import { LandingEditorWorkspace } from './landing-editor-workspace';

export function LandingBuilderApp() {
  const [project, setProject] = useState<LandingProjectState>(() =>
    loadLandingProject(),
  );

  useEffect(() => {
    const t = window.setTimeout(() => saveLandingProject(project), 450);
    return () => window.clearTimeout(t);
  }, [project]);

  const activePage = project.activePageId
    ? project.pages.find((p) => p.id === project.activePageId)
    : null;

  useEffect(() => {
    if (project.activePageId && !activePage) {
      setProject((prev) => ({ ...prev, activePageId: null }));
    }
  }, [project.activePageId, activePage]);

  if (project.activePageId === null || !activePage) {
    return <ProjectPageList project={project} onChange={setProject} />;
  }

  return (
    <LandingEditorWorkspace
      key={activePage.id}
      page={activePage}
      setProject={setProject}
    />
  );
}
