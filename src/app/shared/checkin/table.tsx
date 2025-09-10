'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { useSearchParams, useRouter } from 'next/navigation';
import { getColumns } from '@/app/shared/checkin/columns';
import { useAllActiveUsers } from '@/framework/settings';
import { useAllFilter } from '@/framework/settings';
const FilterElement = dynamic(
  () => import('@/app/shared/checkin/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});



export default function CheckInTable({ data = [], role, getSelectedColumns, getSelectedRowKeys, totalItems  }: { data: any[], role: string, getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>, getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>, totalItems: number }) {
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const { push } = useRouter();
  const [pageSize, setPageSize] = useState(Number(params.get('limit')));
  const { data: allUsers } = useAllActiveUsers(role);
  const { data: allFilters } = useAllFilter()
  const [userFilter, setUserFilter] = useState([])
  const [retailerFilter, setRetailerFilter] = useState([])
  const [regionFilter, setRegionFilter] = useState([])
  const filterState = {
    filter_user: params.get('filter_user') || '',
    filter_store: params.get('filter_store') || '',
    filter_retailer: params.get('filter_retailer') || '',
    date_from: params.get('date_from') || '',
    filter_region: params.get('filter_region') || '',
    filter_city: params.get('filter_city') || '',
    date_to: params.get('date_to') || '',
    role: params.get('role') || ''
  };
  useEffect(() => {
    setUserFilter(allUsers?.data?.map((user : any) => ({
        name: user?.name,
        value: String(user?.id)
    })))
    setRegionFilter(allFilters?.data.regions?.map((region: any) => ({
      name: region?.name,
      value: String(region?.id),
      city: region?.cities
    })))
    setRetailerFilter(allFilters?.data.retailers?.map((retailer: any) => ({
      name: retailer?.name,
      value: String(retailer?.id),
      ...retailer
    })))
  }, [allFilters, allUsers])
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });
  function showDetails(id: string) {
    push(`/check_in_out_report/${role}/${id}`)
  }
  const handleDelete = (ids: string[]) => {}
  

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    // totalItems,
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
    // handleDelete,
    handleReset,
  } = useTable(data, pageSize, filterState);
  const columns = React.useMemo(
    () =>
      getColumns({
        data,
        sortConfig,
        checkedItems: selectedRowKeys,
        onHeaderCellClick,
        onChecked: handleRowSelect,
        handleSelectAll,
        showDetails
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      onHeaderCellClick,
      sortConfig.key,
      sortConfig.direction,
      handleRowSelect,
      handleSelectAll,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } =
    useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns)
    getSelectedRowKeys(selectedRowKeys)
  }, [checkedColumns, selectedRowKeys])

  return (
    <>
      <ControlledTable
        variant="modern"
        data={tableData}
        isLoading={isLoading}
        showLoadingText={true}
        // @ts-ignore
        columns={visibleColumns}
        paginatorOptions={{
          pageSize : pageSize || 10,
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
            userDetails={userFilter}
            retailerDetails={retailerFilter}
            regionDetails={regionFilter}
            role={role}
          />
        }
        tableFooter={
          <TableFooter
            checkedItems={selectedRowKeys}
            handleDelete={(ids: string[]) => {
              setSelectedRowKeys([]);
              handleDelete(ids);
            }}
          >
          </TableFooter>
        }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
}
