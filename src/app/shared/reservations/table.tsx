'use client';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/reservations/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActionIcon } from 'rizzui';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { useDeleteReservation } from '@/framework/reservations';

const FilterElement = dynamic(
  () => import('@/app/shared/reservations/filter-element'),
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

export default function ReservationsTable({ 
  data = [], 
  getSelectedColumns, 
  getSelectedRowKeys, 
  totalItems 
}: { 
  data: any[], 
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>, 
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>, 
  totalItems: number 
}) {
  const { mutate: deleteReservation } = useDeleteReservation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(Number(params.get('limit')) || 10);
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => setColumnFilters((prev) => ({ ...prev, [key]: value }));

  const applyAllFilters = () => {
    const params = new URLSearchParams(searchParams);

    // clear old filters
    for (const [key] of params.entries()) {
      const [prefix] = key.split('_');
      if (columnFilters[prefix]) params.delete(key);
    }

    // build clean query params
    Object.entries(columnFilters).forEach(([key, val]) => {
      const { c1, c2, logic } = val;
      if (c1.value) params.set(`${key}_${c1.op}`, c1.value);
      if (c2.value)
        params.set(`${key}_${c2.op}_${logic === 'or' ? 'or' : 'and'}`, c2.value);
    });

    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    Object.keys(columnFilters).forEach((key) => {
      for (const [paramKey] of params.entries()) {
        if (paramKey.startsWith(`${key}_`)) params.delete(paramKey);
      }
    });
    router.push(`?${params.toString()}`);
    setColumnFilters({});
  };

  const filterState = {
    status: params.get("status") || '',
    client: params.get("client") || '',
    service: params.get("service") || '',
  };

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    const data = ids?.map(id => Number(id));
    deleteReservation({reservation_id: data}, {
      onSuccess: () => {
        toast.success(
          <Text>
            Reservation deleted successfully
          </Text>
        );
      }
    });
  }

  const onDeleteItem = useCallback((id: string[]) => {
    handleDelete(id);
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
    [selectedRowKeys, onHeaderCellClick, sortConfig.key, sortConfig.direction, onDeleteItem, handleRowSelect, handleSelectAll]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);
  
  useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys]);

  return (
    <>
      {/* 🔹 Filter control buttons */}
      <div className="flex justify-end gap-3 mb-3">
        <button
          onClick={clearAllFilters}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Clear Filters
        </button>
        <button
          onClick={applyAllFilters}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* 🔹 Table */}
      <ControlledTable
        variant="modern"
        data={tableData}
        isLoading={isLoading}
        showLoadingText={true}
        columns={visibleColumns}
        expandable={{
          onExpand(expanded, record) {},
          onExpandedRowsChange(expandedKeys) {},
          expandIcon: CustomExpandIcon
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
          onSearchClear: () => {
            handleSearch('');
          },
          onSearchChange: (event) => {
            handleSearch(event.target.value);
          },
          hasSearched: isFiltered,
          columns,
          checkedColumns,
          setCheckedColumns,
          filters
        }}
        filterElement={
          <FilterElement
            isFiltered={isFiltered}
            filters={filters}
            updateFilter={updateFilter}
            handleReset={handleReset}
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