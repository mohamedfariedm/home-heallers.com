'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/customer-suport/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { ActionIcon } from 'rizzui';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { useDeleteCustomerSupport } from '@/framework/customer-suport';

const FilterElement = dynamic(() => import('@/app/shared/regions/filter-element'), { ssr: false });
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), { ssr: false });

function CustomExpandIcon(props: any) {
  return (
    <ActionIcon
      size="sm"
      variant="outline"
      rounded="full"
      className="expand-row-icon mx-2"
      onClick={(e) => props.onExpand(props.record, e)}
    >
      {props.expanded ? <PiCaretUpBold className="h-3.5 w-3.5" /> : <PiCaretDownBold className="h-3.5 w-3.5" />}
    </ActionIcon>
  );
}

export default function CustomerSuportTable({ data = [], getSelectedColumns, getSelectedRowKeys, totalItems,type }: any) {
  const { mutate: deleteRegion } = useDeleteCustomerSupport();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(Number(params.get('limit')) || 10);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => setFilters((prev) => ({ ...prev, [key]: value }));

  const applyAllFilters = () => {
    const params = new URLSearchParams(searchParams);

    // clear old filters
    for (const [key] of params.entries()) {
      const [prefix] = key.split('_');
      if (filters[prefix]) params.delete(key);
    }

    // build clean query params
    Object.entries(filters).forEach(([key, val]) => {
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
    Object.keys(filters).forEach((key) => {
      for (const [paramKey] of params.entries()) {
        if (paramKey.startsWith(`${key}_`)) params.delete(paramKey);
      }
    });
    router.push(`?${params.toString()}`);
    setFilters({});
  };

  // === Table basics ===
  const filterState = { activation: params.get('activation') || '' };

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    filters: baseFilters,
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
        type,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick: (value: string) => ({ onClick: () => handleSort(value) }),
        onDeleteItem: (id: string[]) => handleDelete(id),
        onChecked: handleRowSelect,
        handleSelectAll,
        onFilterChange: handleFilterChange,
      }),
    [selectedRowKeys, sortConfig.key, sortConfig.direction, handleRowSelect, handleSelectAll]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  const handleDelete = (ids: string[]) => {
    const data = ids.map((id) => Number(id));
    deleteRegion(
      { region_id: data },
      {
        onSuccess: () => toast.success(<Text>Customer Support deleted successfully</Text>),
      }
    );
  };

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
        // @ts-ignore
        columns={visibleColumns}
        expandable={{ expandIcon: CustomExpandIcon }}
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
          filters: baseFilters,
        }}
        filterElement={
          <FilterElement
            isFiltered={isFiltered}
            filters={baseFilters}
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
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm"
      />
    </>
  );
}
