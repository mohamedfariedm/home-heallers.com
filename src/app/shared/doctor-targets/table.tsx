'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from './columns';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DoctorTargetsPermissions } from './permissions';

const FilterElement = dynamic(() => import('./filter-element'), { ssr: false });

export default function DoctorTargetsTable({
  data = [],
  getSelectedColumns,
  getSelectedRowKeys,
  totalItems,
  permissions,
}: {
  data: any[];
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>;
  totalItems: number;
  permissions: DoctorTargetsPermissions;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page') || searchParams.get('limit')) || 10
  );

  const filterState = {
    status: searchParams.get('status') || '',
    doctor_id: searchParams.get('doctor_id') || '',
    achievement_min: searchParams.get('achievement_min') || '',
    achievement_max: searchParams.get('achievement_max') || '',
  };

  const onHeaderCellClick = (value: string) => ({
    onClick: () => handleSort(value),
  });

  const {
    isLoading,
    tableData,
    currentPage,
    handlePaginate,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
  } = useTable(data, pageSize, filterState);

  const columns = React.useMemo(
    () =>
      getColumns({
        data: tableData,
        permissions,
        sortConfig,
        onHeaderCellClick,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tableData, sortConfig, selectedRowKeys, permissions]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  // Keep the Actions column visible even if Toggle Columns drops it
  // (empty/first-column headers get squeezed by rc-table + scroll.x).
  const displayColumns = React.useMemo(() => {
    const rest = visibleColumns.filter((col) => col.dataIndex !== 'actions');
    const actionsCol =
      columns.find((col) => col.dataIndex === 'actions') ??
      visibleColumns.find((col) => col.dataIndex === 'actions');
    return actionsCol ? [...rest, actionsCol] : rest;
  }, [visibleColumns, columns]);

  React.useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedColumns, selectedRowKeys]);

  React.useEffect(() => {
    const current =
      Number(searchParams.get('per_page') || searchParams.get('limit')) || 10;
    if (current === pageSize) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('per_page', String(pageSize));
    params.set('limit', String(pageSize));
    params.set('page', '1');
    router.push(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const updateFilter = (columnId: string, filterValue: string | any[]) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = Array.isArray(filterValue)
      ? filterValue.join(',')
      : String(filterValue ?? '');
    if (!value) params.delete(columnId);
    else params.set(columnId, value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('per_page', '10');
    params.set('tab', 'targets');
    router.push(`?${params.toString()}`);
  };

  const isFiltered = Object.values(filterState).some(Boolean) ||
    !!searchParams.get('start_date') ||
    !!searchParams.get('end_date');

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading}
      showLoadingText={true}
      // @ts-ignore
      columns={displayColumns}
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
        <FilterElement
          isFiltered={isFiltered}
          filters={filterState}
          updateFilter={updateFilter}
          handleReset={handleReset}
        />
      }
      tableFooter={null}
      className="rounded-md border border-muted text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
    />
  );
}
