'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { useSearchParams } from 'next/navigation';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/new-installed-POSM/columns';
import { useUsersByRole, useAllFilter } from '@/framework/settings';
const FilterElement = dynamic(
  () => import('@/app/shared/new-installed-POSM/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});



export default function NewInstalledPOSMTable({ data = [],totalItems, setSelectedColumns, getSelectedRowKeys }: { data: any[],totalItems:number, setSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>, getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>> }) {
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const [pageSize, setPageSize] = useState(Number(params.get('limit')));
  const { data: allUsers } = useUsersByRole(['Supervisor', 'Marchindaizer']);
  const { data: allFilters } = useAllFilter()
  const [userFilter, setUserFilter] = useState([])
  const [retailerFilter, setRetailerFilter] = useState([])
  const [regionFilter, setRegionFilter] = useState([])
  const [productFilter, setProductFilter] = useState([])
  const [categoriesFilter, setCategoriesFilter] = useState([])
  const [brandFilter, setBrandFilter] = useState([])
  const filterState = {
    filter_user: params.get('filter_user') || '',
    filter_store: params.get('filter_store') || '',
    filter_brand: params.get('filter_brand') || '',
    // filter_product: params.get('filter_product') || '',
    filter_city: params.get('filter_city') || '',
    filter_retailer: params.get('filter_retailer') || '',
    installation_date_from: params.get('installation_date_from') || '',
    filter_region: params.get('filter_region') || '',
    installation_date_to: params.get('installation_date_to') || '',
    filter_category: params.get('filter_category') || '',
    filter_sub_category: params.get('filter_sub_category') || '',
    filter_sub_sub_category: params.get('filter_sub_sub_category') || '',
  };
  useEffect(() => {
    setUserFilter(allUsers?.data?.map((user : any) => ({
        name: user?.name,
        value: String(user?.id)
    })))
    setBrandFilter(allFilters?.data?.brands?.map((brand: any) => ({
        name: brand?.name,
        value: String(brand?.id)
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
    setProductFilter(allFilters?.data.products?.map((product: any) => ({
        name: product?.sku_code,
        value: String(product?.id)
    })))
    setCategoriesFilter(allFilters?.data.categories)
  }, [allFilters, allUsers])
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

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
    setSelectedColumns(checkedColumns)
    getSelectedRowKeys(selectedRowKeys)
  }, [checkedColumns])

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
            userDetails={userFilter}
            retailerDetails={retailerFilter}
            regionDetails={regionFilter}
            productDetails={productFilter}
            categoriesDetails={categoriesFilter}
            brandDetails={brandFilter}
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
