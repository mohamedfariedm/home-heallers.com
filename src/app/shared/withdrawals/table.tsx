'use client';

import React, { useState } from 'react';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getWithdrawalColumns } from './columns';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusField from '@/components/controlled-table/status-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PiTrashDuotone } from 'react-icons/pi';
import type { WithdrawalsPermissions } from './permissions';

const statusOptions = [
  { value: 'pending', name: 'pending', label: <Text className="ms-2 font-medium">PENDING</Text> },
  { value: 'approved', name: 'approved', label: <Text className="ms-2 font-medium">SETTLED</Text> },
  { value: 'rejected', name: 'rejected', label: <Text className="ms-2 font-medium">REJECTED</Text> },
];

export default function WithdrawalsTable({
  data = [],
  totalItems,
  permissions,
}: {
  data: any[];
  totalItems: number;
  permissions: WithdrawalsPermissions;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page') || searchParams.get('limit')) || 10
  );

  const filterState = {
    status: searchParams.get('status') || '',
    doctor_id: searchParams.get('doctor_id') || '',
  };

  const {
    isLoading,
    tableData,
    currentPage,
    handlePaginate,
  } = useTable(data, pageSize, filterState);

  const columns = React.useMemo(
    () => getWithdrawalColumns({ permissions }),
    [permissions]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  React.useEffect(() => {
    const current =
      Number(searchParams.get('per_page') || searchParams.get('limit')) || 10;
    if (current === pageSize) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('per_page', String(pageSize));
    params.set('page', '1');
    router.push(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const isFiltered = Object.values(filterState).some(Boolean);

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading}
      showLoadingText={true}
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize,
        setPageSize,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => {
          handlePaginate(page);
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', String(page));
          router.push(`?${params.toString()}`);
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
        enableDrawerFilter: true,
      }}
      filterElement={
        <div className="flex w-full flex-col gap-3 @lg:flex-row @lg:items-end">
          <StatusField
            options={statusOptions}
            value={filterState.status}
            onChange={(value: string) => updateFilter('status', value)}
            getOptionValue={(option: { value: any }) => option.value}
            displayValue={(selected: string) =>
              statusOptions.find((o) => o.value === selected)?.name?.toUpperCase() ||
              selected
            }
            placeholder="Status"
            className="w-full @lg:w-40"
          />
          <Input
            label="Doctor ID"
            value={filterState.doctor_id}
            onChange={(e) => updateFilter('doctor_id', e.target.value)}
            className="w-full @lg:w-36"
          />
          {isFiltered && (
            <Button
              size="sm"
              onClick={() => router.push('?page=1&per_page=10')}
              className="h-9 bg-gray-200/70"
              variant="flat"
            >
              <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
            </Button>
          )}
        </div>
      }
      className="rounded-md border border-muted text-sm shadow-sm"
    />
  );
}
