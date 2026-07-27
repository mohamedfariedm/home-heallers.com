'use client';

import { useMemo, useState } from 'react';
import StatusField from '@/components/controlled-table/status-field';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getScheduledColumns } from '@/app/shared/notifications/columns';
import { useCancelScheduledNotification } from '@/framework/notifications';
import { SCHEDULED_STATUS_OPTIONS } from '@/app/shared/notifications/constants';
import type { ScheduledNotification } from '@/types/admin-notifications';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TABLE_CLASS =
  'overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white';

export default function ScheduledNotificationsTable({
  data = [],
  totalItems,
}: {
  data: ScheduledNotification[];
  totalItems: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page')) || 10
  );
  const { mutate: cancel } = useCancelScheduledNotification();

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

  const filterState = {
    status: searchParams.get('status') || '',
  };

  const columns = useMemo(
    () =>
      getScheduledColumns({
        onCancel: (id) => cancel(id),
      }),
    [cancel]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);
  const { isLoading, tableData, currentPage, handlePaginate } = useTable(
    data,
    pageSize,
    filterState
  );

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <StatusField
          placeholder="Status"
          options={SCHEDULED_STATUS_OPTIONS.map((option) => ({
            ...option,
            name: option.value || 'all',
          }))}
          value={filterState.status}
          onChange={(value: string) => pushParams({ status: value })}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            SCHEDULED_STATUS_OPTIONS.find((option) => option.value === selected)
              ?.label ?? 'All statuses'
          }
        />
      </div>

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
            params.set('page', '1');
            params.delete('limit');
            router.push(`${pathname}?${params.toString()}`);
          }) as React.Dispatch<React.SetStateAction<number>>,
          total: totalItems,
          current: currentPage,
          onChange: (page: number) => {
            handlePaginate(page);
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(page));
            params.set('per_page', String(pageSize));
            router.push(`${pathname}?${params.toString()}`);
          },
        }}
        filterOptions={{
          searchTerm: '',
          onSearchClear: () => undefined,
          onSearchChange: () => undefined,
          hasSearched: false,
          columns,
          checkedColumns,
          setCheckedColumns,
          enableDrawerFilter: false,
        }}
        className={TABLE_CLASS}
        scroll={{ x: 1100 }}
      />
    </div>
  );
}
