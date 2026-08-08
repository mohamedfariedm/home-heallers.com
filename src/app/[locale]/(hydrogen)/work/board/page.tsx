'use client';

import { useState } from 'react';
import Spinner from '@/components/ui/spinner';
import { useWmWorkItems } from '@/framework/work-management/work-items';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import {
  useWmProjects,
  useWmWorkflowForProject,
} from '@/framework/work-management/projects';
import WorkKanbanBoard from '@/app/shared/work-management/kanban-board';
import WorkItemForm from '@/app/shared/work-management/work-item-form';
import WorkItemFiltersBar from '@/app/shared/work-management/work-item-filters';
import {
  WmOpenModalButton,
  WmPageHeader,
} from '@/app/shared/work-management/ui';
import { DEFAULT_WORKFLOW } from '@/lib/work-management';
import type { WorkItemFilters } from '@/types/work-management';

export default function WorkBoardPage() {
  const { data: projects = [] } = useWmProjects();
  const { data: departments = [] } = useWmDepartments();
  const activeProjects = projects.filter((p) => p.status === 'active');
  const [projectId, setProjectId] = useState<string>('');
  const effectiveProjectId = projectId || activeProjects[0]?.id || '';

  const [filters, setFilters] = useState<WorkItemFilters>({});

  const boardFilters: WorkItemFilters = {
    ...filters,
    projectId: effectiveProjectId || undefined,
  };

  const { data: items = [], isLoading } = useWmWorkItems(
    effectiveProjectId ? boardFilters : undefined
  );
  const { data: users = [] } = useWmUsers();
  const { data: workflow } = useWmWorkflowForProject(effectiveProjectId);

  return (
    <div>
      <WmPageHeader
        title="Kanban Board"
        description="Drag to change status. Use View / Edit on each card — same rules as the detail page."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm"
              value={effectiveProjectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setFilters((f) => ({ ...f, projectId: e.target.value }));
              }}
            >
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
            <WmOpenModalButton
              label="Create work item"
              view={
                <WorkItemForm
                  defaultProjectId={effectiveProjectId || undefined}
                />
              }
            />
          </div>
        }
      />

      <WorkItemFiltersBar
        filters={{ ...filters, projectId: effectiveProjectId }}
        hideProject
        drawerTitle="Board Filters"
        onChange={(next) => {
          setFilters(next);
          if (next.projectId) setProjectId(next.projectId);
        }}
      />

      {isLoading || !effectiveProjectId ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <WorkKanbanBoard
          items={items}
          users={users}
          projects={projects}
          departments={departments}
          workflow={workflow ?? DEFAULT_WORKFLOW}
        />
      )}
    </div>
  );
}
