'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/centers/columns';
import { useDeleteCenter } from '@/framework/centers';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

const FilterElement = dynamic(
  () => import('@/app/shared/centers/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

export default function CentersTable({
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
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(Number(params.get('limit')) || 10);
  const { mutate: deleteCenter } = useDeleteCenter();

  const filterState = {
    status: params.get('status') || '',
    name: params.get('name') || '',
    phone: params.get('phone') || '',
    email: params.get('email') || '',
  };

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

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    // Delete centers one by one
    let deletedCount = 0;
    ids.forEach((id) => {
      deleteCenter(
        { id: Number(id) },
        {
          onSuccess: () => {
            deletedCount++;
            if (deletedCount === ids.length) {
              toast.success(<Text>{ids.length} center(s) deleted successfully</Text>);
            }
          },
          onError: () => {
            toast.error(<Text>Failed to delete center</Text>);
          },
        }
      );
    });
  };

  const onDeleteItem = useCallback(
    (id: string[]) => {
      handleDelete(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
      sortConfig,
      data,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedColumns]);

  useEffect(() => {
    getSelectedRowKeys(selectedRowKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowKeys]);

  return (
    <>
      <ControlledTable
        variant="modern"
        isLoading={isLoading}
        showLoadingText={true}
        data={tableData}
        columns={visibleColumns}
        paginatorOptions={{
          pageSize,
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
          onSearchChange: (event: any) => {
            handleSearch(event.target.value);
          },
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
            updateFilter={updateFilter}
            handleReset={handleReset}
          />
        }
        tableFooter={
          <TableFooter
            checkedItems={selectedRowKeys}
            handleDelete={(ids: string[]) => {
              handleDelete(ids);
              setSelectedRowKeys([]);
            }}
          />
        }
        className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:border-t-0"
      />
    </>
  );
}
