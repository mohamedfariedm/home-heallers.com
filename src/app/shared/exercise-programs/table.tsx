'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/exercise-programs/columns';
import { useSendExerciseProgram } from '@/framework/exercise-programs';
import type { ExerciseProgram } from '@/types/admin-exercise-programs';

const FilterElement = dynamic(
  () => import('@/app/shared/exercise-programs/filter-element'),
  { ssr: false }
);

const TABLE_CLASS =
  'overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white';

const FILTER_KEYS = [
  'search',
  'doctor_id',
  'client_id',
  'status',
  'has_feedback',
] as const;

export default function ExerciseProgramsTable({
  data = [],
  getSelectedColumns,
  totalItems,
}: {
  data: ExerciseProgram[];
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>;
  totalItems: number;
}) {
  const { mutate: sendProgram, isPending: isSending } = useSendExerciseProgram();
  const [sendingId, setSendingId] = useState<number | null>(null);
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
    doctor_id: searchParams.get('doctor_id') || '',
    client_id: searchParams.get('client_id') || '',
    status: searchParams.get('status') || '',
    has_feedback: searchParams.get('has_feedback') || '',
  };

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    filters,
    searchTerm,
    handleSearch,
    handleReset: resetTable,
  } = useTable(data, pageSize, filterState);

  const columns = useMemo(
    () =>
      getColumns({
        sendingId: isSending ? sendingId : null,
        onSend: (id) => {
          setSendingId(id);
          sendProgram(id, {
            onSettled: () => setSendingId(null),
          });
        },
      }),
    [isSending, sendingId, sendProgram]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns);
  }, [checkedColumns, getSelectedColumns]);

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
        drawerTitle: 'Program filters',
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
        />
      }
      className={TABLE_CLASS}
      scroll={{ x: 1200 }}
    />
  );
}
