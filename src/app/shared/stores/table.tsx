'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/stores/columns';
import { useDeleteStore } from '@/framework/stores';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { useAllFilter } from '@/framework/settings';
const FilterElement = dynamic(
  () => import('@/app/shared/stores/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});



export default function StoresTable({ data = [], getSelectedColumns, getSelectedRowKeys, totalItems }: { data: any[], getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>, getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>, totalItems: number }) {
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const [pageSize, setPageSize] = useState(Number(params.get('limit')));
  const { mutate: deleteStore } = useDeleteStore();
  const { data: allFilters } = useAllFilter()
  const [userFilter, setUserFilter] = useState([])
  const [retailerFilter, setRetailerFilter] = useState([])
  const [typeFilter, setTypeFilter] = useState([])
  const [regionFilter, setRegionFilter] = useState([])
  const [storeFilter, setStoreFilter] = useState([])

  const filterState = {
    // store_id: params.get('store_id') || '',
    city_id: params.get('city_id') || '',
    retailer_id: params.get('retailer_id') || '',
    region_id: params.get('region_id') || '',
    type:params.get("type")||"",
    activation:params.get("activation")||"",

  };
  useEffect(() => {

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
    setStoreFilter(allFilters?.data.stores?.map((store: any) => ({
      name: store?.name,
      value: String(store?.id),
    })))
    setTypeFilter(allFilters?.data.stores_types?.map((type: any) => ({
      name: type,
      value: String(type),
    })))

  }, [allFilters])


  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    const data = ids?.map(id => Number(id))
    deleteStore({store_id: data}, {
      onSuccess: () => {
        toast.success(
          <Text>
            Store deleted successfully
          </Text>
        );
      }
    })
  }
  const onDeleteItem = useCallback((id: string[]) => {
    handleDelete(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onDeleteItem,
        onChecked: handleRowSelect,
        handleSelectAll,
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
            retailerDetails={retailerFilter}
            regionDetails={regionFilter}
            typeDetails={typeFilter}
            // storeDetails={storeFilter}     
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
            {/* <Button size="sm" className="dark:bg-gray-300 dark:text-gray-800">
              Re-send {selectedRowKeys.length}{' '}
              {selectedRowKeys.length > 1 ? 'Roles' : 'Role'}{' '}
            </Button> */}
          </TableFooter>
        }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
}
