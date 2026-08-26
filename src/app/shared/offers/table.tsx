'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getColumns } from '@/app/shared/offers/columns';
import { Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDeletePackages } from '@/framework/packages';
import { OFFER_PAGE_SIZE_KEY, OFFER_PAGE_SIZES } from '@/types/offer';
import { EmptyProductBoxIcon, SearchNotFoundIcon } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import Link from 'next/link';

const FilterElement = dynamic(
  () => import('@/app/shared/offers/filter-element'),
  { ssr: false }
);
const TableFooter = dynamic(() => import('@/app/shared/table-footer'), {
  ssr: false,
});

function readStoredPageSize() {
  if (typeof window === 'undefined') return 25;
  const stored = Number(window.localStorage.getItem(OFFER_PAGE_SIZE_KEY));
  return (OFFER_PAGE_SIZES as readonly number[]).includes(stored) ? stored : 25;
}

export default function OffersTable({
  data = [],
  getSelectedColumns,
  getSelectedRowKeys,
  totalItems,
  isFetching,
  canDelete = true,
}: {
  data: any[];
  getSelectedColumns: React.Dispatch<React.SetStateAction<any[]>>;
  getSelectedRowKeys: React.Dispatch<React.SetStateAction<any[]>>;
  totalItems: number;
  isFetching?: boolean;
  canDelete?: boolean;
}) {
  const { mutate: deleteOffer } = useDeletePackages();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();
  const params = new URLSearchParams(searchParams);
  const [pageSize, setPageSize] = useState(
    Number(params.get('limit')) || readStoredPageSize()
  );

  const filterState = {
    is_active: params.get('is_active') || '',
    category_id: params.get('category_id') || '',
    city_id: params.get('city_id') || '',
    sort: params.get('sort') || '',
    price_min: params.get('price_min') || '',
    price_max: params.get('price_max') || '',
    is_featured: params.get('is_featured') || '',
    is_best_seller: params.get('is_best_seller') || '',
    is_most_popular: params.get('is_most_popular') || '',
    is_new: params.get('is_new') || '',
  };
  const initialSearch = params.get('name') || '';

  const pushQuery = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) nextParams.set(key, value);
        else nextParams.delete(key);
      });
      nextParams.set('type', 'offer');
      nextParams.set('page', '1');
      if (!nextParams.get('limit')) nextParams.set('limit', String(pageSize));
      router.push(`${pathName}?${nextParams.toString()}`);
    },
    [pathName, router, searchParams, pageSize]
  );

  const onHeaderCellClick = (value: string) => ({
    onClick: () => handleSort(value),
  });

  const handleDelete = (ids: string[]) => {
    ids.forEach((id) => {
      deleteOffer(
        { id: Number(id) },
        {
          onSuccess: () => {
            toast.success(<Text>Offer deleted successfully</Text>);
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
      const current = params.get('name') || '';
      const next = searchTerm.trim();
      if (current === next) return;
      pushQuery({ name: next || null });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleFilterUpdate = (columnId: string, filterValue: string | any[]) => {
    if (Array.isArray(filterValue)) return;
    if (
      columnId === 'price_min' &&
      filters.price_max &&
      filterValue &&
      Number(filterValue) > Number(filters.price_max)
    ) {
      toast.error('Min price must be less than or equal to max price');
      return;
    }
    if (
      columnId === 'price_max' &&
      filters.price_min &&
      filterValue &&
      Number(filterValue) < Number(filters.price_min)
    ) {
      toast.error('Max price must be greater than or equal to min price');
      return;
    }
    updateFilter(columnId, filterValue);
    pushQuery({ [columnId]: filterValue ? String(filterValue) : null });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    window.localStorage.setItem(OFFER_PAGE_SIZE_KEY, String(size));
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('type', 'offer');
    nextParams.set('limit', String(size));
    nextParams.set('page', '1');
    router.push(`${pathName}?${nextParams.toString()}`);
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
        canDelete,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedRowKeys,
      sortConfig.key,
      sortConfig.direction,
      onDeleteItem,
      handleRowSelect,
      handleSelectAll,
      data,
      canDelete,
    ]
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  useEffect(() => {
    getSelectedColumns(checkedColumns);
    getSelectedRowKeys(selectedRowKeys);
  }, [checkedColumns, selectedRowKeys, getSelectedColumns, getSelectedRowKeys]);

  const hasActiveFilters = Boolean(
    searchTerm || Object.values(filterState).some((value) => value)
  );

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden rounded-t-md bg-gray-100">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      )}
      <div className={isFetching ? 'opacity-60' : undefined}>
        <ControlledTable
          variant="modern"
          data={tableData}
          isLoading={false}
          showLoadingText={true}
          // @ts-ignore
          columns={visibleColumns}
          emptyText={
            hasActiveFilters ? (
              <div className="py-10 text-center">
                <SearchNotFoundIcon className="mx-auto h-auto w-32 text-gray-400" />
                <Text className="mt-3 font-medium">No offers match these filters</Text>
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={() => {
                    handleSearch('');
                    Object.keys(filterState).forEach((key) => updateFilter(key, ''));
                    pushQuery({
                      name: null,
                      is_active: null,
                      category_id: null,
                      city_id: null,
                      sort: null,
                      price_min: null,
                      price_max: null,
                      is_featured: null,
                      is_best_seller: null,
                      is_most_popular: null,
                      is_new: null,
                    });
                  }}
                >
                  Reset
                </Button>
              </div>
            ) : (
              <div className="py-10 text-center">
                <EmptyProductBoxIcon className="mx-auto h-auto w-32 text-gray-400" />
                <Text className="mt-3 font-medium">Create your first offer</Text>
                <Link href={routes.offers.create}>
                  <Button className="mt-3">New Offer</Button>
                </Link>
              </div>
            )
          }
          paginatorOptions={{
            pageSize: pageSize || 25,
            setPageSize: handlePageSizeChange as any,
            pageSizeOptions: [...OFFER_PAGE_SIZES],
            total: totalItems,
            current: currentPage,
            onChange: (page: number) => handlePaginate(page),
          }}
          filterOptions={{
            searchTerm,
            onSearchClear: () => {
              handleSearch('');
              pushQuery({ name: null });
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
                handleSearch('');
                Object.keys(filterState).forEach((key) => updateFilter(key, ''));
                pushQuery({
                  name: null,
                  is_active: null,
                  category_id: null,
                  city_id: null,
                  sort: null,
                  price_min: null,
                  price_max: null,
                  is_featured: null,
                  is_best_seller: null,
                  is_most_popular: null,
                  is_new: null,
                });
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
          className="overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}
