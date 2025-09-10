'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/blogs/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { ActionIcon } from 'rizzui';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { useDeleteBlog } from '@/framework/blog';
const FilterElement = dynamic(
  () => import('@/app/shared/regions/filter-element'),
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


export default function BlogTable({ data = [], getSelectedColumns, getSelectedRowKeys, totalItems }: { data: any[], getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>, getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>, totalItems: number }) {
  const { mutate: deleteRegion } = useDeleteBlog();
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams)
  const [pageSize, setPageSize] = useState(Number(params.get('limit')));

  const filterState = {
    activation:params.get("activation") || '',
  };
  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    const data = ids?.map(id => Number(id))
    deleteRegion({region_id: data}, {
      onSuccess: () => {
        toast.success(
          <Text>
            Blog deleted successfully
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
