'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getUserActivityColumns } from '@/app/shared/user-activity-reports/columns';
import type { UserActivityRow } from '@/types/user-activity-report';

const FilterElement = dynamic(
  () => import('@/app/shared/user-activity-reports/filter-element'),
  { ssr: false }
);

const SORTABLE_COLUMNS = new Set([
  'total_actions',
  'last_activity_at',
  'first_activity_at',
  'name',
]);

export default function UserActivityReportsTable({
  data = [],
  totalItems,
  getSelectedColumns,
  getSelectedRowKeys,
}: {
  data: UserActivityRow[];
  totalItems: number;
  getSelectedColumns: React.Dispatch<React.SetStateAction<unknown[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<unknown[]>>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page') || searchParams.get('limit')) || 25
  );
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') ?? ''
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') ?? '';
      if (searchInput.trim() === currentSearch.trim()) return;

      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchInput.trim();
      if (trimmed) params.set('search', trimmed);
      else params.delete('search');
      params.set('page', '1');
      params.set('per_page', String(pageSize));
      params.delete('limit');
      if (!params.get('tab')) params.set('tab', 'users');
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, pageSize, pathname, router, searchParams]);

  const pushParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set('page', '1');
    params.set('per_page', String(pageSize));
    params.delete('limit');
    if (!params.get('tab')) params.set('tab', 'users');
    router.push(`${pathname}?${params.toString()}`);
  };

  const filterState = {
    search: searchParams.get('search') || '',
    actor_id: searchParams.get('actor_id') || '',
    actor_name: searchParams.get('actor_name') || '',
    actor_email: searchParams.get('actor_email') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    time: searchParams.get('time') || '',
    time_from: searchParams.get('time_from') || '',
    time_to: searchParams.get('time_to') || '',
    event: searchParams.get('event') || '',
    log_name: searchParams.get('log_name') || '',
    subject_type: searchParams.get('subject_type') || '',
    only_created: searchParams.get('only_created') || '',
    only_updated: searchParams.get('only_updated') || '',
    only_deleted: searchParams.get('only_deleted') || '',
    only_login_related: searchParams.get('only_login_related') || '',
    only_request_related: searchParams.get('only_request_related') || '',
  };

  const sortConfig = useMemo(
    () => ({
      key: searchParams.get('sort_by'),
      direction: searchParams.get('sort_direction'),
    }),
    [searchParams]
  );

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      if (!SORTABLE_COLUMNS.has(value)) return;

      const currentSortBy = searchParams.get('sort_by') ?? 'total_actions';
      const currentDirection = searchParams.get('sort_direction') ?? 'desc';
      const nextDirection =
        currentSortBy === value && currentDirection === 'desc' ? 'asc' : 'desc';

      pushParams({
        sort_by: value,
        sort_direction: nextDirection,
      });
    },
  });

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    filters,
    updateFilter,
    searchTerm,
    handleSearch,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleReset: resetTable,
  } = useTable(data, pageSize, filterState);

  const updateFilterAndUrl = (
    columnId: string,
    filterValue: string | unknown[]
  ) => {
    updateFilter(columnId, filterValue as string);
    pushParams({
      ...Object.fromEntries(
        Object.entries({ ...filters, [columnId]: filterValue as string }).map(
          ([key, value]) => [key, String(value ?? '')]
        )
      ),
      [columnId]: String(filterValue ?? ''),
    });
  };

  const handleReset = () => {
    resetTable();
    setSearchInput('');
    setPageSize(25);
    router.push(`${pathname}?tab=users&page=1&per_page=25`);
  };

  const columns = React.useMemo(
    () =>
      getUserActivityColumns({
        sortConfig,
        onHeaderCellClick,
      }),
    [sortConfig, onHeaderCellClick]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys, getSelectedColumns, getSelectedRowKeys]);

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading}
      showLoadingText
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize,
        setPageSize: ((size: number) => {
          setPageSize(size);
          const params = new URLSearchParams(searchParams.toString());
          params.set('per_page', String(size));
          params.delete('limit');
          if (!params.get('tab')) params.set('tab', 'users');
          router.push(`${pathname}?${params.toString()}`);
        }) as React.Dispatch<React.SetStateAction<number>>,
        total: totalItems,
        current: currentPage,
        onChange: handlePaginate,
      }}
      filterOptions={{
        searchTerm: searchInput || searchTerm,
        onSearchClear: () => {
          setSearchInput('');
          handleSearch('');
          pushParams({ search: '' });
        },
        onSearchChange: (event) => {
          setSearchInput(event.target.value);
          handleSearch(event.target.value);
        },
        hasSearched: isFiltered || Boolean(searchInput),
        showSearchOnTheRight: true,
        enableDrawerFilter: true,
        drawerTitle: 'User Activity Filters',
        columns,
        checkedColumns,
        setCheckedColumns,
        filters,
      }}
      filterElement={
        <FilterElement
          filters={filters}
          updateFilter={updateFilterAndUrl}
          handleReset={handleReset}
        />
      }
      className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white"
    />
  );
}
