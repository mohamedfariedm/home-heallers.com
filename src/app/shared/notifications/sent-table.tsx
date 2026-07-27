'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTable } from '@/hooks/use-table';
import { useColumn } from '@/hooks/use-column';
import ControlledTable from '@/components/controlled-table';
import { getSentColumns } from '@/app/shared/notifications/columns';
import type { SentNotification } from '@/types/admin-notifications';

const FilterElement = dynamic(
  () => import('@/app/shared/notifications/sent-filter-element'),
  { ssr: false }
);

const TABLE_CLASS =
  'overflow-hidden rounded-md border border-gray-200 text-sm shadow-sm [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:h-60 [&_.rc-table-placeholder_.rc-table-expanded-row-fixed>div]:justify-center [&_.rc-table-row:last-child_td.rc-table-cell]:border-b-0 [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white';

export default function SentNotificationsTable({
  data = [],
  totalItems,
}: {
  data: SentNotification[];
  totalItems: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const localePrefix = `/${pathname.split('/')[1] || 'en'}`;
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('per_page')) || 10
  );
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') ?? '';
      if (searchInput.trim() === currentSearch.trim()) return;

      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchInput.trim();
      if (trimmed) params.set('search', trimmed);
      else params.delete('search');
      params.set('page', '1');
      params.set('per_page', String(pageSize));
      params.delete('limit');
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, pageSize, pathname, router, searchParams]);

  const pushParams = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set('page', '1');
    params.set('per_page', String(pageSize));
    params.delete('limit');
    router.push(`${pathname}?${params.toString()}`);
  };

  const filterState = {
    search: searchParams.get('search') || '',
    source: searchParams.get('source') || '',
    recipient_type: searchParams.get('recipient_type') || '',
    status: searchParams.get('status') || '',
    lang: searchParams.get('lang') || '',
    type: searchParams.get('type') || '',
    created_by: searchParams.get('created_by') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  };

  const columns = useMemo(() => getSentColumns(localePrefix), [localePrefix]);
  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  const {
    isLoading,
    isFiltered,
    tableData,
    currentPage,
    handlePaginate,
    filters,
    searchTerm,
    handleSearch,
    handleReset: resetTable,
  } = useTable(data, pageSize, filterState);

  const handleReset = () => {
    resetTable();
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    [
      'search',
      'source',
      'recipient_type',
      'status',
      'lang',
      'type',
      'created_by',
      'from',
      'to',
    ].forEach((key) => params.delete(key));
    params.set('page', '1');
    params.set('per_page', String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <ControlledTable
      variant="modern"
      data={tableData}
      isLoading={isLoading}
      showLoadingText
      // @ts-ignore
      columns={visibleColumns}
      paginatorOptions={{
        pageSize,
        setPageSize: ((size: number) => {
          setPageSize(size);
          const params = new URLSearchParams(searchParams.toString());
          params.set('per_page', String(size));
          params.set('page', '1');
          params.delete('limit');
          router.push(`${pathname}?${params.toString()}`);
        }) as React.Dispatch<React.SetStateAction<number>>,
        total: totalItems,
        current: currentPage,
        onChange: (page: number) => {
          handlePaginate(page);
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', String(page));
          params.set('per_page', String(pageSize));
          router.push(`${pathname}?${params.toString()}`);
        },
      }}
      filterOptions={{
        searchTerm: searchInput || searchTerm,
        onSearchClear: () => {
          setSearchInput('');
          handleSearch('');
          pushParams({ search: '' });
        },
        onSearchChange: (event) => {
          setSearchInput(event.target.value);
          handleSearch(event.target.value);
        },
        hasSearched: isFiltered || Boolean(searchInput),
        showSearchOnTheRight: true,
        enableDrawerFilter: true,
        drawerTitle: 'Sent notification filters',
        columns,
        checkedColumns,
        setCheckedColumns,
        filters,
      }}
      filterElement={
        <FilterElement
          filters={filters}
          updateFilter={(columnId, filterValue) =>
            pushParams({ [columnId]: String(filterValue ?? '') })
          }
          handleReset={handleReset}
        />
      }
      className={TABLE_CLASS}
      scroll={{ x: 1500 }}
    />
  );
}
