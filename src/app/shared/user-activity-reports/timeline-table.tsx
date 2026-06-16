'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/activity-logs/columns';
import type { ActivityLog } from '@/types/activity-log';

const SORTABLE_COLUMNS = new Set(['created_at']);

export default function UserActivityTimelineTable({
  data = [],
  totalItems,
}: {
  data: ActivityLog[];
  totalItems: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page') || searchParams.get('limit')) || 25
  );

  const pushParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set('page', '1');
    params.set('per_page', String(pageSize));
    params.delete('limit');
    router.push(`${pathname}?${params.toString()}`);
  };

  const sortConfig = useMemo(
    () => ({
      key: searchParams.get('sort_by') ?? 'created_at',
      direction: searchParams.get('sort_direction') ?? 'desc',
    }),
    [searchParams]
  );

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      if (!SORTABLE_COLUMNS.has(value)) return;

      const currentSortBy = searchParams.get('sort_by') ?? 'created_at';
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
    tableData,
    currentPage,
    handlePaginate,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useTable(data, pageSize, {});

  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        onHeaderCellClick,
      }),
    [data, sortConfig, onHeaderCellClick]
  );

  const { visibleColumns } = useColumn(columns);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [data, setSelectedRowKeys]);

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
          router.push(`${pathname}?${params.toString()}`);
        }) as React.Dispatch<React.SetStateAction<number>>,
        total: totalItems,
        current: currentPage,
        onChange: handlePaginate,
      }}
      className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white"
    />
  );
}
