'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/invoices/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { ActionIcon } from 'rizzui';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { useDeleteInvoices } from '@/framework/invoices';

const FilterElement = dynamic(
  () => import('@/app/shared/invoices/filter-element'),
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

export default function InvoicesTable({
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
  const { mutate: deleteInvoice } = useDeleteInvoices();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(Number(params.get('limit')) || 10);

  // ✅ URL-based filter initialization
  const filterState = {
    activation: params.get('activation') || '',
    invoice_number: params.get('invoice_number') || '',
    customer_name: params.get('customer_name') || '',
    category_name: params.get('category_name') || '',
    status: params.get('status') || '',
    invoice_date: params.get('invoice_date')
      ? params.get('invoice_date')
      : '',
  };

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    const payload = ids?.map((id) => Number(id));
    deleteInvoice(
      { region_id: payload },
      {
        onSuccess: () => {
          toast.success(<Text>Invoice deleted successfully</Text>);
        },
      }
    );
  };

  const onDeleteItem = useCallback(
    (ids: string[]) => {
      handleDelete(ids);
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
      }),
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
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys, getSelectedColumns, getSelectedRowKeys]);

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading}
      showLoadingText={true}
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize: pageSize,
        setPageSize,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => handlePaginate(page),
      }}
      filterOptions={{
        searchTerm,
        onSearchClear: () => handleSearch(''),
        onSearchChange: (e) => handleSearch(e.target.value),
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
            setSelectedRowKeys([]);
            handleDelete(ids);
          }}
        />
      }
      className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm 
      [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 
      [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center 
      [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 
      [&_thead.rc-table-thead]:border-t-0"
    />
  );
}
