'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/patients/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActionIcon } from 'rizzui';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { useDeletePatients } from '@/framework/patients';

const FilterElement = dynamic(
  () => import('@/app/shared/patients/filter-element'),
  { ssr: false }
);

const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

function CustomExpandIcon(props: any) {
  return (
    <ActionIcon
      size="sm"
      variant="outline"
      rounded="full"
      className="expand-row-icon mx-2"
      onClick={(e) => {
        props.onExpand(props.record, e);
      }}
    >
      {props.expanded ? (
        <PiCaretUpBold className="h-3.5 w-3.5" />
      ) : (
        <PiCaretDownBold className="h-3.5 w-3.5" />
      )}
    </ActionIcon>
  );
}

export default function PationtsTable({
  data = [],
  getSelectedColumns,
  getSelectedRowKeys,
  totalItems,
}: {
  data: any[];
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>;
  totalItems: number;
}) {
  const { mutate: deletePatient } = useDeletePatients();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(Number(searchParams.get('limit')) || 10);
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [dateFilters, setDateFilters] = useState<{ date_from?: string; date_to?: string }>({
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
  });

  const handleFilterChange = (key: string, value: any) =>
    setColumnFilters((prev) => ({ ...prev, [key]: value }));

  const handleDateChange = (dates: { date_from?: string; date_to?: string }) => {
    setDateFilters(dates);
  };

  const filterState = {
    status: searchParams.get('status') || '',
    gender: searchParams.get('gender') || '',
  };

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    const payload = ids?.map((id) => Number(id));
    deletePatient(
      { region_id: payload },
      {
        onSuccess: () => {
          toast.success(<Text>Patient deleted successfully</Text>);
        },
      }
    );
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
    updateFilter,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    selectedRowKeys,
    setSelectedRowKeys,
    handleRowSelect,
    handleSelectAll,
    handleReset,
  } = useTable(data, pageSize, filterState);

  const drawerFilterKeys = ['status', 'gender'] as const;

  const applyAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    Array.from(params.entries()).forEach(([key]) => {
      const [prefix] = key.split('_');
      if (columnFilters[prefix]) params.delete(key);
    });

    params.delete('date_from');
    params.delete('date_to');
    drawerFilterKeys.forEach((key) => params.delete(key));

    Object.entries(columnFilters).forEach(([key, val]) => {
      const { c1, c2, logic } = val;
      if (c1.value) params.set(`${key}_${c1.op}`, c1.value);
      if (c2.value)
        params.set(`${key}_${c2.op}_${logic === 'or' ? 'or' : 'and'}`, c2.value);
    });

    drawerFilterKeys.forEach((key) => {
      const value = filters[key];
      if (value) params.set(key, String(value));
    });

    if (dateFilters.date_from) params.set('date_from', dateFilters.date_from);
    if (dateFilters.date_to) params.set('date_to', dateFilters.date_to);

    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
        onFilterChange: handleFilterChange,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const currentLimit = searchParams.get('limit') || '10';
    params.set('page', '1');
    params.set('limit', currentLimit);
    setColumnFilters({});
    setDateFilters({ date_from: undefined, date_to: undefined });
    handleReset();
    handleSearch('');
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys]);

  return (
    <>
      <div className="mb-3 flex justify-end gap-3">
        <button
          onClick={clearAllFilters}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          Clear Filters
        </button>
        <button
          onClick={applyAllFilters}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      <ControlledTable
        variant="modern"
        data={tableData}
        isLoading={isLoading}
        showLoadingText={true}
        // @ts-ignore
        columns={visibleColumns}
        expandable={{
          onExpand() {},
          onExpandedRowsChange() {},
          expandIcon: CustomExpandIcon,
        }}
        paginatorOptions={{
          pageSize: pageSize || 10,
          setPageSize,
          total: totalItems,
          current: currentPage,
          onChange: (page: number) => handlePaginate(page),
        }}
        filterOptions={{
          searchTerm,
          onSearchClear: () => handleSearch(''),
          onSearchChange: (event) => handleSearch(event.target.value),
          hasSearched: isFiltered,
          columns,
          checkedColumns,
          setCheckedColumns,
          filters: {
            ...filters,
            ...(dateFilters.date_from && { date_from: dateFilters.date_from }),
            ...(dateFilters.date_to && { date_to: dateFilters.date_to }),
          },
        }}
        filterElement={
          <FilterElement
            isFiltered={isFiltered}
            filters={filters}
            updateFilter={updateFilter}
            handleReset={handleReset}
            onDateChange={handleDateChange}
            currentDates={dateFilters}
          />
        }
        tableFooter={
          <TableFooter
            checkedItems={selectedRowKeys}
            handleDelete={(ids: string[]) => {
              setSelectedRowKeys([]);
              handleDelete(ids);
            }}
          />
        }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
}
