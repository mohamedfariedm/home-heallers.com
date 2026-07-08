'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/coupons/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ActionIcon } from 'rizzui';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { useDeleteCoupons } from '@/framework/coupons';

const FilterElement = dynamic(
  () => import('@/app/shared/coupons/filter-element'),
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

export default function CouponsTable({
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
  const { mutate: deleteCoupon } = useDeleteCoupons();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(Number(params.get('limit')) || 10);

  const filterState = {
    type: params.get('type') || '',
    is_active: params.get('is_active') || '',
  };
  const initialSearch = params.get('code') || '';

  const pushQuery = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) nextParams.set(key, value);
        else nextParams.delete(key);
      });
      nextParams.set('page', '1');
      router.push(`${pathName}?${nextParams.toString()}`);
    },
    [pathName, router, searchParams]
  );

  const onHeaderCellClick = (value: string) => ({
    onClick: () => {
      handleSort(value);
    },
  });

  const handleDelete = (ids: string[]) => {
    ids.forEach((id) => {
      deleteCoupon(
        { coupon_id: id },
        {
          onSuccess: () => {
            toast.success(<Text>Coupon deleted successfully</Text>);
          },
        }
      );
    });
  };

  const onDeleteItem = useCallback((id: string[]) => {
    handleDelete(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const searchSyncedRef = useRef(false);

  useEffect(() => {
    if (initialSearch) handleSearch(initialSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!searchSyncedRef.current) {
      searchSyncedRef.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      const currentCode = params.get('code') || '';
      const nextCode = searchTerm.trim();
      if (currentCode === nextCode) return;
      pushQuery({ code: nextCode || null });
    }, 500);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleFilterUpdate = (
    columnId: string,
    filterValue: string | any[]
  ) => {
    if (Array.isArray(filterValue)) return;
    const value: string | null = filterValue ? String(filterValue) : null;
    updateFilter(columnId, filterValue);
    const queryUpdate: Record<string, string | null> = { [columnId]: value };
    pushQuery(queryUpdate);
  };

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
      data,
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
      expandable={{
        onExpand() {},
        onExpandedRowsChange() {},
        expandIcon: CustomExpandIcon,
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
          pushQuery({ code: null });
        },
        onSearchChange: (event) => {
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
          updateFilter={handleFilterUpdate}
          handleReset={() => {
            handleReset();
            pushQuery({ type: null, is_active: null, code: null });
          }}
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
  );
}
