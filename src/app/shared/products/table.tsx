'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import { Button } from '@/components/ui/button';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/products/columns';
import { useDeleteProduct } from '@/framework/products';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useAllFilter, useUsersByRole } from '@/framework/settings';
import { useSearchParams } from 'next/navigation';
const FilterElement = dynamic(
  () => import('@/app/shared/products/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});


export default function ProductsTable({ data = [], getSelectedColumns, getSelectedRowKeys, totalItems }: { data: any[], getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>, getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>, totalItems: number }) {
  const { mutate: deleteProduct } = useDeleteProduct();
  const { data: allUsers } = useUsersByRole(['Supervisor', 'Marchindaizer']);
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const { data: allFilters } = useAllFilter()
  const [userFilter, setUserFilter] = useState([])
  const [categoriesFilter, setCategoriesFilter] = useState([])
  const [brandFilter, setBrandFilter] = useState([])
  const [pageSize, setPageSize] = useState(Number(params.get('limit')));
  const filterState = {
    user_id: params.get('user_id') || '',
    brand_id: params.get('brand_id') || '',
    // filter_product: params.get('filter_product') || '',
    // filter_city: params.get('filter_city') || '',
    // filter_retailer: params.get('filter_retailer') || '',
    // installation_date_from: params.get('installation_date_from') || '',
    // filter_region: params.get('filter_region') || '',
    // installation_date_to: params.get('installation_date_to') || '',
    BG: params.get('BG') || '',
    VCP: params.get('VCP') || '',
    BU: params.get('Bu') || '',
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
    // setRegionFilter(allFilters?.data.regions?.map((region: any) => ({
    //   name: region?.name,
    //   value: String(region?.id),
    //   city: region?.cities
    // })))
    // setRetailerFilter(allFilters?.data.retailers?.map((retailer: any) => ({
    //   name: retailer?.name,
    //   value: String(retailer?.id),
    //   ...retailer
    // })))
    // setProductFilter(allFilters?.data.products?.map((product: any) => ({
    //     name: product?.sku_code,
    //     value: String(product?.id)
    // })))
    setCategoriesFilter(allFilters?.data.categories)
  }, [allFilters, allUsers])
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    const data = ids?.map(id => Number(id))
    deleteProduct({product_id: data}, {
      onSuccess: () => {
        toast.success(
          <Text>
            Product deleted successfully
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
            userDetails={userFilter}
            // retailerDetails={retailerFilter}
            // regionDetails={regionFilter}
            // productDetails={productFilter}
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
