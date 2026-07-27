'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/otp-codes/columns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useExtendOtpExpiration } from '@/framework/otp-codes';
import type { OtpCodeTableRow } from '@/types/otp-codes';

const FilterElement = dynamic(
  () => import('@/app/shared/otp-codes/filter-element'),
  { ssr: false }
);

export default function OtpCodesTable({
  data = [],
  getSelectedColumns,
  getSelectedRowKeys,
  totalItems,
}: {
  data: OtpCodeTableRow[];
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>;
  totalItems: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(Number(params.get('limit')) || 20);
  const { mutate: extendExpiration, isPending: isExtending } =
    useExtendOtpExpiration();
  const [extendingId, setExtendingId] = useState<string | null>(null);

  const filterState = {
    type: params.get('type') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
  };
  const initialSearch = params.get('name') || '';

  const pushQuery = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) nextParams.set(key, value);
        else nextParams.delete(key);
      });
      nextParams.set('page', '1');
      router.push(`${pathName}?${nextParams.toString()}`);
    },
    [pathName, router, searchParams]
  );

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
    handleReset,
  } = useTable(data, pageSize, filterState);

  const searchSyncedRef = useRef(false);

  useEffect(() => {
    if (initialSearch) handleSearch(initialSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!searchSyncedRef.current) {
      searchSyncedRef.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      const currentName = params.get('name') || '';
      const nextName = searchTerm.trim();
      if (currentName === nextName) return;
      pushQuery({ name: nextName || null });
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleFilterUpdate = (
    columnId: string,
    filterValue: string | any[]
  ) => {
    if (Array.isArray(filterValue)) return;
    const value: string | null = filterValue ? String(filterValue) : null;
    updateFilter(columnId, filterValue);
    pushQuery({ [columnId]: value });
  };

  const handleExtend = useCallback(
    (row: OtpCodeTableRow) => {
      setExtendingId(row.id);
      extendExpiration(
        { type: row.type, id: row.entity_id },
        {
          onSettled: () => setExtendingId(null),
        }
      );
    },
    [extendExpiration]
  );

  const columns = React.useMemo(
    () =>
      getColumns({
        onExtend: handleExtend,
        extendingId: isExtending ? extendingId : null,
      }),
    [handleExtend, extendingId, isExtending]
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
      showLoadingText={true}
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize: pageSize || 20,
        setPageSize,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => handlePaginate(page),
      }}
      filterOptions={{
        searchTerm,
        onSearchClear: () => {
          handleSearch('');
          pushQuery({ name: null });
        },
        onSearchChange: (event) => {
          handleSearch(event.target.value);
        },
        hasSearched: isFiltered,
        columns,
        checkedColumns,
        setCheckedColumns,
        filters,
      }}
      filterElement={
        <FilterElement
          isFiltered={isFiltered}
          filters={filters}
          updateFilter={handleFilterUpdate}
          handleReset={() => {
            handleReset();
            pushQuery({
              type: null,
              date_from: null,
              date_to: null,
              name: null,
            });
          }}
        />
      }
      className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
    />
  );
}
