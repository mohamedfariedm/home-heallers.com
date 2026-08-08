'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { PiFunnel, PiMagnifyingGlassBold, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Input } from '@/components/ui/input';
import { Title } from '@/components/ui/text';
import cn from '@/utils/class-names';
import type { WorkItemFilters } from '@/types/work-management';
import WorkItemFilterElement from './work-item-filter-element';

const Drawer = dynamic(
  () => import('@/components/ui/drawer').then((module) => module.Drawer),
  { ssr: false }
);

const EMPTY_FILTERS: WorkItemFilters = {
  q: '',
  projectId: undefined,
  departmentId: undefined,
  type: '',
  status: '',
  priority: '',
  assigneeId: undefined,
  reporterId: undefined,
  overdue: undefined,
  unassigned: undefined,
  dueFrom: undefined,
  dueTo: undefined,
};

function toDraft(filters: WorkItemFilters): WorkItemFilters {
  return {
    ...EMPTY_FILTERS,
    ...filters,
    q: filters.q ?? '',
    type: filters.type ?? '',
    status: filters.status ?? '',
    priority: filters.priority ?? '',
  };
}

function normalizeApplied(draft: WorkItemFilters): WorkItemFilters {
  const dueFrom = draft.dueFrom
    ? draft.dueFrom.includes('T')
      ? draft.dueFrom
      : `${draft.dueFrom}T00:00:00.000Z`
    : undefined;
  const dueTo = draft.dueTo
    ? draft.dueTo.includes('T')
      ? draft.dueTo
      : `${draft.dueTo}T23:59:59.999Z`
    : undefined;

  return {
    ...draft,
    q: draft.q || '',
    projectId: draft.projectId || undefined,
    departmentId: draft.departmentId || undefined,
    type: draft.type || '',
    status: draft.status || '',
    priority: draft.priority || '',
    assigneeId: draft.assigneeId || undefined,
    reporterId: draft.reporterId || undefined,
    overdue: draft.overdue ? true : undefined,
    unassigned: draft.unassigned ? true : undefined,
    dueFrom,
    dueTo,
    myWorkUserId: draft.myWorkUserId,
  };
}

function countActive(filters: WorkItemFilters) {
  let n = 0;
  if (filters.projectId) n += 1;
  if (filters.departmentId) n += 1;
  if (filters.type) n += 1;
  if (filters.status) n += 1;
  if (filters.priority) n += 1;
  if (filters.assigneeId) n += 1;
  if (filters.reporterId) n += 1;
  if (filters.overdue) n += 1;
  if (filters.unassigned) n += 1;
  if (filters.dueFrom) n += 1;
  if (filters.dueTo) n += 1;
  return n;
}

export default function WorkItemFiltersBar({
  filters,
  onChange,
  onSaveView,
  hideProject,
  drawerTitle = 'Work Item Filters',
}: {
  filters: WorkItemFilters;
  onChange: (next: WorkItemFilters) => void;
  onSaveView?: () => void;
  hideProject?: boolean;
  drawerTitle?: string;
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.q ?? '');
  const [draft, setDraft] = useState<WorkItemFilters>(() => toDraft(filters));

  useEffect(() => {
    setSearchTerm(filters.q ?? '');
  }, [filters.q]);

  useEffect(() => {
    if (openDrawer) {
      setDraft(toDraft(filters));
    }
  }, [openDrawer, filters]);

  const updateDraft = (key: keyof WorkItemFilters, value: string) => {
    setDraft((prev) => {
      if (key === 'overdue' || key === 'unassigned') {
        return {
          ...prev,
          [key]: value === '1' ? true : undefined,
        };
      }
      if (
        key === 'projectId' ||
        key === 'departmentId' ||
        key === 'assigneeId' ||
        key === 'reporterId'
      ) {
        return { ...prev, [key]: value || undefined };
      }
      if (key === 'dueFrom' || key === 'dueTo') {
        return { ...prev, [key]: value || undefined };
      }
      return { ...prev, [key]: value };
    });
  };

  const applySearch = () => {
    onChange(normalizeApplied({ ...filters, q: searchTerm }));
  };

  const showResults = () => {
    onChange(
      normalizeApplied({
        ...draft,
        q: searchTerm,
        myWorkUserId: filters.myWorkUserId,
      })
    );
    setOpenDrawer(false);
  };

  const clearDraft = () => {
    setDraft({
      ...EMPTY_FILTERS,
      myWorkUserId: filters.myWorkUserId,
      ...(hideProject && filters.projectId
        ? { projectId: filters.projectId }
        : {}),
    });
  };

  const activeCount = countActive(filters);

  return (
    <div className="table-filter mb-4 flex items-center justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          type="search"
          placeholder="Search by anything..."
          value={searchTerm}
          onClear={() => {
            setSearchTerm('');
            onChange(normalizeApplied({ ...filters, q: '' }));
          }}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') applySearch();
          }}
          inputClassName="h-9"
          clearable={true}
          prefix={
            <PiMagnifyingGlassBold
              onClick={applySearch}
              className="h-4 w-4 cursor-pointer"
            />
          }
        />
      </div>

      <div className="ms-4 flex flex-shrink-0 items-center gap-2">
        {onSaveView ? (
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={onSaveView}
          >
            Save view
          </Button>
        ) : null}

        <Button
          onClick={() => setOpenDrawer((open) => !open)}
          variant="outline"
          className={cn('me-0 h-9 pe-3 ps-2.5')}
        >
          <PiFunnel className="me-1.5 h-[18px] w-[18px]" strokeWidth={1.7} />
          Filters
          {activeCount > 0 ? (
            <span className="ms-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </div>

      <Drawer
        size="sm"
        placement="right"
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        overlayClassName="dark:bg-opacity-20 backdrop-blur-md"
        containerClassName="dark:bg-gray-100 overflow-y-scroll"
      >
        <div className="flex h-full flex-col p-5">
          <div className="-mx-5 mb-6 flex items-center justify-between border-b border-gray-200 px-5 pb-4">
            <Title as="h5">{drawerTitle}</Title>
            <ActionIcon
              size="sm"
              rounded="full"
              variant="text"
              title="Close Filter"
              onClick={() => setOpenDrawer(false)}
            >
              <PiXBold className="h-4 w-4" />
            </ActionIcon>
          </div>
          <div className="flex-grow">
            <div className="grid grid-cols-1 gap-6 [&_.price-field>span.mr-2]:mb-1.5 [&_.price-field]:flex-col [&_.price-field]:items-start [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-wrapper_.w-72]:w-full [&_.text-gray-500]:text-gray-700 [&_button.h-9]:h-10 sm:[&_button.h-9]:h-11 [&_label>.h-9]:h-10 sm:[&_label>.h-9]:h-11 [&_label>.w-24.h-9]:w-full">
              <WorkItemFilterElement
                filters={draft}
                updateFilter={updateDraft}
                handleReset={clearDraft}
                hideProject={hideProject}
              />
            </div>
          </div>
          <Button
            size="lg"
            onClick={showResults}
            className="mt-5 h-11 w-full text-sm"
          >
            Show Results
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
