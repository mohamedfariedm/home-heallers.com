'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/exercises/columns';
import { useDeleteExercise } from '@/framework/exercises';
import type { Exercise } from '@/types/admin-exercises';

const FilterElement = dynamic(
  () => import('@/app/shared/exercises/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

const TABLE_CLASS =
  'overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white';

const FILTER_KEYS = [
  'search',
  'body_part',
  'equipment',
  'target',
  'muscle_group',
  'is_active',
  'is_rehabilitation',
  'rehab_category_id',
  'rehabilitation_review_status',
] as const;

export default function ExercisesTable({
  data = [],
  getSelectedColumns,
  getSelectedRowKeys,
  totalItems,
  rehabilitationReviewMode = false,
}: {
  data: Exercise[];
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>;
  totalItems: number;
  rehabilitationReviewMode?: boolean;
}) {
  const { mutate: deleteExercise } = useDeleteExercise();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('limit')) || 20
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
      params.set('limit', String(pageSize));
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
    params.set('limit', String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const filterState = {
    search: searchParams.get('search') || '',
    body_part: searchParams.get('body_part') || '',
    equipment: searchParams.get('equipment') || '',
    target: searchParams.get('target') || '',
    muscle_group: searchParams.get('muscle_group') || '',
    is_active: searchParams.get('is_active') || '',
    is_rehabilitation: searchParams.get('is_rehabilitation') || '',
    rehab_category_id: searchParams.get('rehab_category_id') || '',
    rehabilitation_review_status:
      searchParams.get('rehabilitation_review_status') || '',
  };

  const handleDelete = (ids: string[]) => {
    const id = Number(ids[0]);
    if (!id) return;
    deleteExercise({ id });
  };

  const onDeleteItem = useCallback((id: string[]) => {
    handleDelete(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    filters,
    searchTerm,
    handleSearch,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleReset: resetTable,
  } = useTable(data, pageSize, filterState);

  const columns = useMemo(
    () =>
      getColumns({
        data,
        checkedItems: selectedRowKeys,
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
        rehabilitationReviewMode,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
      data,
      rehabilitationReviewMode,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys, getSelectedColumns, getSelectedRowKeys]);

  const handleReset = () => {
    resetTable();
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((key) => params.delete(key));
    params.set('page', '1');
    params.set('limit', String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

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
          params.set('limit', String(size));
          params.set('page', '1');
          router.push(`${pathname}?${params.toString()}`);
        }) as React.Dispatch<React.SetStateAction<number>>,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => {
          handlePaginate(page);
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', String(page));
          params.set('limit', String(pageSize));
          router.push(`${pathname}?${params.toString()}`);
        },
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
        drawerTitle: 'Exercise filters',
        columns,
        checkedColumns,
        setCheckedColumns,
        filters,
      }}
      filterElement={
        <FilterElement
          filters={filters}
          updateFilter={(columnId, filterValue) =>
            pushParams({ [columnId]: String(filterValue ?? '') })
          }
          handleReset={handleReset}
          rehabilitationReviewMode={rehabilitationReviewMode}
        />
      }
      tableFooter={!rehabilitationReviewMode ? (
        <TableFooter
          checkedItems={selectedRowKeys}
          handleDelete={(ids: string[]) => {
            setSelectedRowKeys([]);
            handleDelete(ids);
          }}
        />
      ) : undefined}
      className={TABLE_CLASS}
      scroll={{ x: 1200 }}
    />
  );
}
