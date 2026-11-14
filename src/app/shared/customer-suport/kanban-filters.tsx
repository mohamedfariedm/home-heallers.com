'use client';

import { useState, useEffect, useMemo } from 'react';
import { PiFunnel, PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import StatusField from '@/components/controlled-table/status-field';
import ColumnFilterPopover from './column-filter-popover';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import { usePackages } from '@/framework/packages';
import { useAssignableUsers } from '@/framework/customer-suport';
import {
  KANBAN_FILTERABLE_COLUMNS,
  getKanbanFilterColumnLabel,
} from './kanban-filter-columns';

const Drawer = dynamic(
  () => import('@/components/ui/drawer').then((module) => ({ default: module.Drawer })),
  { ssr: false }
);

export type KanbanAssignmentFilters = {
  assigned_to_id?: string;
  assignment_state?: string;
};

interface KanbanFiltersProps {
  onFilterChange: (
    filters: Record<string, any>,
    dates?: { date_from?: string; date_to?: string },
    assignment?: KanbanAssignmentFilters
  ) => void;
  onClearFilters: () => void;
  currentFilters?: Record<string, any>;
  currentDates?: { date_from?: string; date_to?: string };
  currentAssignment?: KanbanAssignmentFilters;
  /** Range restored on Clear All (page default). */
  defaultDates?: { date_from?: string; date_to?: string };
}

const ASSIGNMENT_STATE_OPTIONS = [
  { value: '', name: 'All' },
  { value: 'assigned', name: 'Assigned' },
  { value: 'unassigned', name: 'Unassigned' },
];

export default function KanbanFilters({
  onFilterChange,
  onClearFilters,
  currentFilters = {},
  currentDates,
  currentAssignment,
  defaultDates,
}: KanbanFiltersProps) {
  const { data: packagesData, isLoading: offerOptionsLoading } = usePackages('limit=1000');
  const offerOptions = useMemo(() => {
    const list = packagesData?.data ?? [];
    return (list as any[]).map((pkg) => {
      const ar = String(pkg?.name?.ar || '').trim();
      const en = String(pkg?.name?.en || '').trim();
      const value = ar || en || String(pkg?.id ?? '');
      const label = ar || en || `Package #${pkg?.id}`;
      return { value, label };
    }).filter((o) => o.value);
  }, [packagesData]);

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [dateFrom, setDateFrom] = useState(currentDates?.date_from || '');
  const [dateTo, setDateTo] = useState(currentDates?.date_to || '');
  const [assignedToId, setAssignedToId] = useState(
    currentAssignment?.assigned_to_id || ''
  );
  const [assignmentState, setAssignmentState] = useState(
    currentAssignment?.assignment_state || ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const { data: assignableUsers = [], isLoading: assignableUsersLoading } =
    useAssignableUsers(isOpen);

  const assignToOptions = useMemo(
    () => [
      { value: '', name: 'All users' },
      ...assignableUsers.map((user) => ({
        value: String(user.id),
        name:
          typeof user.open_assigned_count === 'number'
            ? `${user.name} (${user.open_assigned_count})`
            : user.name,
      })),
    ],
    [assignableUsers]
  );

  // Keep assignment badge in sync with URL while the drawer is closed
  useEffect(() => {
    if (isOpen) return;
    setAssignedToId(currentAssignment?.assigned_to_id || '');
    setAssignmentState(currentAssignment?.assignment_state || '');
  }, [
    isOpen,
    currentAssignment?.assigned_to_id,
    currentAssignment?.assignment_state,
  ]);

  // Sync local filters with current applied filters when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    if (Object.keys(currentFilters).length > 0) {
      setFilters(currentFilters);
    } else {
      setFilters({});
    }
    setDateFrom(currentDates?.date_from || '');
    setDateTo(currentDates?.date_to || '');
    setAssignedToId(currentAssignment?.assigned_to_id || '');
    setAssignmentState(currentAssignment?.assignment_state || '');
    // Only re-sync when the drawer opens; avoid wiping in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(
      filters,
      { date_from: dateFrom, date_to: dateTo },
      {
        assigned_to_id: assignedToId || undefined,
        assignment_state: assignmentState || undefined,
      }
    );
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    // Wipe all filters including dates
    setFilters({});
    setDateFrom('');
    setDateTo('');
    setAssignedToId('');
    setAssignmentState('');

    setResetKey((prev) => prev + 1);

    onClearFilters();
  };

  // Merge local filters with current (URL) filters to avoid double counting
  const mergedFilters = useMemo(() => {
    const keys = new Set<string>([
      ...Object.keys(currentFilters || {}),
      ...Object.keys(filters || {}),
    ]);
    const result: Record<string, any> = {};
    keys.forEach((key) => {
      const localVal = filters[key];
      const urlVal = currentFilters[key];
      const localActive = !!(localVal?.c1?.value || localVal?.c2?.value);
      const urlActive = !!(urlVal?.c1?.value || urlVal?.c2?.value);
      // Prefer local when it has values, else fallback to URL
      result[key] = localActive ? localVal : urlActive ? urlVal : undefined;
    });
    return result;
  }, [filters, currentFilters]);

  const hasAssignmentFilters = !!assignedToId || !!assignmentState;

  const hasActiveFilters =
    Object.keys(mergedFilters).some(
      (key) => mergedFilters[key]?.c1?.value || mergedFilters[key]?.c2?.value
    ) ||
    !!dateFrom ||
    !!dateTo ||
    hasAssignmentFilters;

  const activeFilterCount =
    Object.keys(mergedFilters).filter(
      (key) => mergedFilters[key]?.c1?.value || mergedFilters[key]?.c2?.value
    ).length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (assignedToId ? 1 : 0) +
    (assignmentState ? 1 : 0);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2 border-gray-200 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
      >
        <PiFunnel className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 rounded-full bg-[#143087] px-2 py-0.5 text-xs font-medium text-white">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="right"
        size="lg"
        overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-sm"
        containerClassName="dark:bg-gray-100"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            <Title as="h5" className="font-semibold text-[#143087]">
              Advanced Filters
            </Title>
            <ActionIcon
              size="sm"
              rounded="full"
              variant="text"
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-50 hover:text-[#143087] dark:hover:bg-blue-900/20"
            >
              <PiXBold className="h-4 w-4" />
            </ActionIcon>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Date Filters */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-50">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                    Date From
                  </label>
                  {dateFrom && (
                    <span className="rounded-full bg-[#143087] px-2 py-0.5 text-xs font-medium text-white">
                      Active
                    </span>
                  )}
                </div>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                  inputClassName="border-gray-200 dark:border-gray-700 focus:ring-[#143087]/20 rounded-lg h-9"
                />
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-50">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                    Date To
                  </label>
                  {dateTo && (
                    <span className="rounded-full bg-[#143087] px-2 py-0.5 text-xs font-medium text-white">
                      Active
                    </span>
                  )}
                </div>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                  inputClassName="border-gray-200 dark:border-gray-700 focus:ring-[#143087]/20 rounded-lg h-9"
                />
              </div>
            </div>

            {/* Assignment Filters */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div
                className={cn(
                  'rounded-2xl border p-4 shadow-sm transition-colors',
                  assignmentState
                    ? 'border-[#143087]/40 bg-blue-50 dark:border-blue-700/50 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-50'
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                    Assignment State
                  </label>
                  {assignmentState && (
                    <span className="rounded-full bg-[#143087] px-2 py-0.5 text-xs font-medium text-white">
                      Active
                    </span>
                  )}
                </div>
                <StatusField
                  key={`assignment-state-${resetKey}`}
                  options={ASSIGNMENT_STATE_OPTIONS}
                  value={assignmentState}
                  onChange={(value: string) => {
                    const next = String(value ?? '');
                    setAssignmentState(next);
                    if (next === 'unassigned') setAssignedToId('');
                  }}
                  getOptionValue={(option) => option.value}
                  displayValue={(selected: string) =>
                    ASSIGNMENT_STATE_OPTIONS.find((o) => o.value === selected)
                      ?.name ?? 'All'
                  }
                  placeholder="All"
                />
              </div>

              <div
                className={cn(
                  'rounded-2xl border p-4 shadow-sm transition-colors',
                  assignedToId
                    ? 'border-[#143087]/40 bg-blue-50 dark:border-blue-700/50 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-50'
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                    Assign To
                  </label>
                  {assignedToId && (
                    <span className="rounded-full bg-[#143087] px-2 py-0.5 text-xs font-medium text-white">
                      Active
                    </span>
                  )}
                </div>
                <StatusField
                  key={`assigned-to-${resetKey}`}
                  options={assignToOptions}
                  value={assignedToId}
                  disabled={
                    assignableUsersLoading || assignmentState === 'unassigned'
                  }
                  onChange={(value: string) => {
                    const next = String(value ?? '');
                    setAssignedToId(next);
                    if (next && assignmentState === 'unassigned') {
                      setAssignmentState('assigned');
                    }
                  }}
                  getOptionValue={(option) => option.value}
                  displayValue={(selected: string) =>
                    assignToOptions.find((o) => o.value === selected)?.name ??
                    'All users'
                  }
                  placeholder={
                    assignableUsersLoading ? 'Loading users...' : 'All users'
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {KANBAN_FILTERABLE_COLUMNS.map((columnKey) => {
                const columnLabel = getKanbanFilterColumnLabel(columnKey);
                const hasFilter =
                  mergedFilters[columnKey]?.c1?.value ||
                  mergedFilters[columnKey]?.c2?.value;

                return (
                  <div
                    key={columnKey}
                    className={cn(
                      'rounded-2xl border p-4 shadow-sm transition-colors',
                      hasFilter
                        ? 'border-[#143087]/40 bg-blue-50 dark:border-blue-700/50 dark:bg-blue-900/20'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-50'
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 dark:text-gray-900">
                        {columnLabel}
                      </label>
                      {hasFilter && (
                        <span className="rounded-full bg-[#143087] px-2 py-0.5 text-xs font-medium text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ColumnFilterPopover
                        key={resetKey > 0 ? `${columnKey}-${resetKey}` : columnKey}
                        columnKey={columnKey}
                        onFilterChange={handleFilterChange}
                        initialValue={resetKey > 0 ? undefined : (filters[columnKey] || currentFilters[columnKey] || undefined)}
                        offerOptions={columnKey === 'offer' ? offerOptions : undefined}
                        offerOptionsLoading={columnKey === 'offer' ? offerOptionsLoading : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1 border-gray-200 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-[#143087] hover:bg-[#0F2466]"
              >
                Apply Filters
                {hasActiveFilters && (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
   
    </>
  );
}
