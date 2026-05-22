'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getZatcaColumns } from '@/app/shared/zatca/zatca-columns';
import type { ZatcaInvoice } from '@/types/zatca';
import type { ZatcaPermissions } from '@/app/shared/zatca/permissions';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const FilterElement = dynamic(
  () => import('@/app/shared/zatca/zatca-filter-element'),
  { ssr: false }
);

export default function ZatcaInvoicesTable({
  data: rawData = [],
  totalItems,
  permissions,
  getSelectedColumns,
  getSelectedRowKeys,
}: {
  data: ZatcaInvoice[];
  totalItems: number;
  permissions: ZatcaPermissions;
  getSelectedColumns: React.Dispatch<React.SetStateAction<unknown[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<unknown[]>>;
}) {
  const data = Array.isArray(rawData) ? rawData : [];
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page') || searchParams.get('limit')) || 25
  );

  const pushFilters = (next: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    p.set('page', '1');
    p.set('per_page', String(pageSize));
    p.delete('limit');
    router.push(`${pathname}?${p.toString()}`);
  };

  const filterState = {
    search: searchParams.get('search') || '',
    document_type: searchParams.get('document_type') || '',
    zatca_status: searchParams.get('zatca_status') || '',
    business_status: searchParams.get('business_status') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    client_id: searchParams.get('client_id') || '',
  };

  const onHeaderCellClick = (value: string) => ({
    onClick: () => handleSort(value),
  });

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
    handleReset: resetTable,
  } = useTable(data, pageSize, filterState);

  const updateFilterAndUrl = (columnId: string, filterValue: string | unknown[]) => {
    updateFilter(columnId, filterValue as string);
    pushFilters({
      ...Object.fromEntries(
        Object.entries({ ...filters, [columnId]: filterValue as string }).map(
          ([k, v]) => [k, String(v ?? '')]
        )
      ),
      [columnId]: String(filterValue ?? ''),
    });
  };

  const handleReset = () => {
    resetTable();
    router.push(`${pathname}?page=1&per_page=${pageSize}`);
  };

  const handleSearchUrl = (value: string) => {
    handleSearch(value);
    pushFilters({ search: value });
  };

  const columns = React.useMemo(
    () =>
      getZatcaColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onChecked: handleRowSelect,
        handleSelectAll,
        permissions,
      }),
    [selectedRowKeys, sortConfig, data, permissions, handleRowSelect, handleSelectAll]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys, getSelectedColumns, getSelectedRowKeys]);

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading}
      showLoadingText
      columns={visibleColumns}
      paginatorOptions={{
        pageSize,
        setPageSize: (size: number) => {
          setPageSize(size);
          const p = new URLSearchParams(searchParams.toString());
          p.set('per_page', String(size));
          p.delete('limit');
          router.push(`${pathname}?${p.toString()}`);
        },
        total: totalItems,
        current: currentPage,
        onChange: handlePaginate,
      }}
      filterOptions={{
        searchTerm,
        onSearchClear: () => handleSearchUrl(''),
        onSearchChange: (e) => handleSearchUrl(e.target.value),
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
          updateFilter={updateFilterAndUrl}
          handleReset={handleReset}
        />
      }
      className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm 
      [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 
      [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 
      [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white"
    />
  );
}
