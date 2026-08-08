'use client';

import { useState } from 'react';
import Spinner from '@/components/ui/spinner';
import {
  useWmWorkItems,
} from '@/framework/work-management/work-items';
import { useWmDepartments, useWmUsers } from '@/framework/work-management/departments';
import { useWmProjects } from '@/framework/work-management/projects';
import { useWmActorId } from '@/framework/work-management/keys';
import { WmActorSwitcher } from '@/framework/work-management/actor-switcher';
import type { WorkItemFilters } from '@/types/work-management';
import WorkItemFiltersBar from '@/app/shared/work-management/work-item-filters';
import WorkItemsTable from '@/app/shared/work-management/work-items-table';
import { WmPageHeader } from '@/app/shared/work-management/ui';

export default function MyWorkPage() {
  const actorId = useWmActorId();
  const [filters, setFilters] = useState<WorkItemFilters>({
    myWorkUserId: actorId,
  });

  const queryFilters = { ...filters, myWorkUserId: actorId };
  const { data: items = [], isLoading } = useWmWorkItems(queryFilters);
  const { data: users = [] } = useWmUsers();
  const { data: projects = [] } = useWmProjects();
  const { data: departments = [] } = useWmDepartments();

  return (
    <div>
      <WmPageHeader
        title="My Work"
        description="Everything currently assigned to you."
        action={<WmActorSwitcher />}
      />
      <WorkItemFiltersBar
        filters={filters}
        drawerTitle="My Work Filters"
        onChange={(next) => setFilters({ ...next, myWorkUserId: actorId })}
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
