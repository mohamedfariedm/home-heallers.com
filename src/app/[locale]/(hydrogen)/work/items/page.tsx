'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import {
  useDeleteSavedView,
  useSaveView,
  useWmSavedViews,
  useWmWorkItems,
} from '@/framework/work-management/work-items';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import { useWmProjects } from '@/framework/work-management/projects';
import { useWmActorId } from '@/framework/work-management/keys';
import type { WorkItemFilters } from '@/types/work-management';
import WorkItemFiltersBar from '@/app/shared/work-management/work-item-filters';
import WorkItemsTable from '@/app/shared/work-management/work-items-table';
import WorkItemForm from '@/app/shared/work-management/work-item-form';
import {
  WmOpenModalButton,
  WmPageHeader,
} from '@/app/shared/work-management/ui';

function filtersFromSearch(params: URLSearchParams): WorkItemFilters {
  return {
    q: params.get('q') ?? '',
    projectId: params.get('projectId') || undefined,
    departmentId: params.get('departmentId') || undefined,
    type: (params.get('type') as WorkItemFilters['type']) || '',
    status: params.get('status') || '',
    priority: (params.get('priority') as WorkItemFilters['priority']) || '',
    assigneeId: params.get('assigneeId') || undefined,
    reporterId: params.get('reporterId') || undefined,
    overdue: params.get('overdue') === '1' || undefined,
    unassigned: params.get('unassigned') === '1' || undefined,
  };
}

export default function WorkItemsPage() {
  const searchParams = useSearchParams();
  const actorId = useWmActorId();
  const [filters, setFilters] = useState<WorkItemFilters>(() =>
    filtersFromSearch(searchParams)
  );
  const [viewName, setViewName] = useState('');
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const { data: items = [], isLoading } = useWmWorkItems(filters);
  const { data: users = [] } = useWmUsers();
  const { data: projects = [] } = useWmProjects();
  const { data: departments = [] } = useWmDepartments();
  const { data: savedViews = [] } = useWmSavedViews(actorId);
  const saveView = useSaveView();
  const deleteView = useDeleteSavedView();

  return (
    <div>
      <WmPageHeader
        title="Work Items"
        description="Search and filter across departments and projects. View or edit any row."
        action={
          <WmOpenModalButton label="Create work item" view={<WorkItemForm />} />
        }
      />

      {savedViews.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Saved views
          </span>
          {savedViews.map((v) => (
            <div
              key={v.id}
              className={`inline-flex items-center overflow-hidden rounded-full border ${
                activeViewId === v.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <button
                type="button"
                className="px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setFilters({ ...v.filters });
                  setActiveViewId(v.id);
                }}
              >
                {v.name}
              </button>
              <button
                type="button"
                className="border-l border-gray-200 px-2 py-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                onClick={() =>
                  deleteView.mutate({ id: v.id, userId: actorId })
                }
                aria-label={`Delete ${v.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-2 max-w-xs">
        <Input
          placeholder="Optional name for Save view"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          inputClassName="h-9"
        />
      </div>

      <WorkItemFiltersBar
        filters={filters}
        drawerTitle="Work Item Filters"
        onChange={(next) => {
          setFilters(next);
          setActiveViewId(null);
        }}
        onSaveView={() => {
          const name =
            viewName.trim() ||
            window.prompt('Name this saved view') ||
            '';
          if (!name.trim()) return;
          saveView.mutate({ userId: actorId, name: name.trim(), filters });
          setViewName('');
        }}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <WorkItemsTable
          items={items}
          users={users}
          projects={projects}
          departments={departments}
        />
      )}
    </div>
  );
}
