'use client';

import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useCustomerSupport,
  useUpdateCustomerSupport,
} from '@/framework/customer-suport';
import CustomerSupportKanban from '@/app/shared/customer-suport/kanban-board';
import { useState, useEffect } from 'react';
import Pagination from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { useModal } from '@/app/shared/modal-views/use-modal';
import CreateOrUpdateCustomerSupport from '@/app/shared/customer-suport/suport-form';
import { PiPlusBold } from 'react-icons/pi';
import KanbanFilters from '@/app/shared/customer-suport/kanban-filters';

const pageHeader = {
  title: 'Operation Customer Supports - Kanban',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Operation Customer Supports - Kanban',
    },
  ],
};

const STATUS_COLUMNS = [
  { id: 'new', label: 'New', status: 'new' },
  { id: 'negotiation', label: 'Negotiation', status: 'negotiation' },
  { id: 'success', label: 'Success', status: 'success' },
  { id: 'possible', label: 'Possible', status: 'possible' },
  { id: 'failed', label: 'Failed', status: 'failed' },
];

export default function CustomerSupportsOperationKanbanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal } = useModal();

  // Single page state for all columns
  const currentPage = parseInt(searchParams.get('page') || '1', 5);
  const [page, setPage] = useState(currentPage);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Sync page state with URL params
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 5);
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [searchParams, page]);

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    const filterableColumns = [
      'name', 'offer', 'agent_name', 'status', 'reason', 'age', 'gender',
      'lead_source', 'source_campaign', 'mobile_phone', 'booking_phone_number',
      'home_phone', 'address_1', 'description', 'first_call_time',
      'last_call_result', 'last_call_total_duration', 'last_phone', 'notes',
      'ads_name', 'created_at', 'communication_channel'
    ];

    filterableColumns.forEach((key) => {
      const params: any = {};
      Array.from(searchParams.entries()).forEach(([paramKey, paramValue]) => {
        if (paramKey.startsWith(`${key}_`)) {
          const parts = paramKey.split('_');
          if (parts.length >= 2) {
            const op = parts.slice(1, -1).join('_');
            if (!params.c1) {
              params.c1 = { op, value: paramValue };
            } else if (!params.c2) {
              const logic = parts[parts.length - 1] === 'or' ? 'or' : 'and';
              params.c2 = { op: op.replace(/_or$|_and$/, ''), value: paramValue };
              params.logic = logic;
            }
          }
        }
      });
      if (params.c1 || params.c2) {
        initialFilters[key] = { c1: params.c1 || { op: 'equal', value: '' }, c2: params.c2 || { op: 'equal', value: '' }, logic: params.logic || 'and' };
      }
    });

    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, []);

  // Build filter params
  const buildFilterParams = (status: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '5');
    params.set('type', 'operation');
    params.set('status_equal', status);

    // Apply filters
    Object.entries(filters).forEach(([key, val]) => {
      const { c1, c2, logic } = val;
      if (c1?.value) params.set(`${key}_${c1.op}`, c1.value);
      if (c2?.value)
        params.set(`${key}_${c2.op}_${logic === 'or' ? 'or' : 'and'}`, c2.value);
    });

    return params.toString();
  };

  // Fetch data for each column separately with the same page
  const newData = useCustomerSupport(buildFilterParams('new'));

  const failedData = useCustomerSupport(buildFilterParams('failed'));
  const successData = useCustomerSupport(buildFilterParams('success'));
  const possibleData = useCustomerSupport(buildFilterParams('possible'));
  const negotiationData = useCustomerSupport(buildFilterParams('negotiation'));

  // Combine all column data
  const columnData: Record<
    string,
    { data: any; meta: any; isLoading: boolean }
  > = {
    new: {
      data: newData.data,
      meta: newData.data?.meta,
      isLoading: newData.isLoading,
    },
    failed: {
      data: failedData.data,
      meta: failedData.data?.meta,
      isLoading: failedData.isLoading,
    },
    success: {
      data: successData.data,
      meta: successData.data?.meta,
      isLoading: successData.isLoading,
    },
    possible: {
      data: possibleData.data,
      meta: possibleData.data?.meta,
      isLoading: possibleData.isLoading,
    },
    negotiation: {
      data: negotiationData.data,
      meta: negotiationData.data?.meta,
      isLoading: negotiationData.isLoading,
    },
  };

  const { mutate: updateCustomerSupport } = useUpdateCustomerSupport();

  const handleStatusChange = (
    itemId: number,
    newStatus: string,
    oldStatus: string
  ) => {
    // Find the item in the old status column data
    const oldColumnData = columnData[oldStatus]?.data?.data || [];
    const item = oldColumnData.find((item: any) => item.id === itemId);

    if (item) {
      updateCustomerSupport({
        lead_id: itemId,
        ...item,
        status: newStatus,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const handleCreateClick = () => {
    openModal({
      view: <CreateOrUpdateCustomerSupport type="operation" />,
      customSize: '900px',
    });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    // Clear old filter params
    Object.keys(filters).forEach((key) => {
      for (const [paramKey] of params.entries()) {
        if (paramKey.startsWith(`${key}_`)) params.delete(paramKey);
      }
    });

    // Add new filter params
    Object.entries(newFilters).forEach(([key, val]) => {
      const { c1, c2, logic } = val;
      if (c1?.value) params.set(`${key}_${c1.op}`, c1.value);
      if (c2?.value)
        params.set(`${key}_${c2.op}_${logic === 'or' ? 'or' : 'and'}`, c2.value);
    });

    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    // Reset local filter state
    setFilters({});
    setPage(1);

    // Create a completely new URLSearchParams with ONLY page=1
    // This ensures all filter params are removed
    const params = new URLSearchParams();
    params.set('page', '1');
    
    // Use replace to avoid adding to history and force a clean URL
    router.replace(`?${params.toString()}`);
  };

  // Calculate total items - use the maximum total from any column for pagination
  const totalItems = Math.max(
    newData.data?.meta?.total || 0,
    failedData.data?.meta?.total || 0,
    successData.data?.meta?.total || 0,
    possibleData.data?.meta?.total || 0,
    negotiationData.data?.meta?.total || 0
  );

  // Show pagination if we have any items (even if less than 5, to show page 1 of 1)
  const needsPagination = totalItems > 0;

  // Check if any column is loading
  const isLoading = Object.values(columnData).some((col) => col.isLoading);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex w-full flex-col gap-3 @lg:mt-0 @lg:flex-row @lg:items-center @lg:justify-end">
          <KanbanFilters
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            currentFilters={filters}
          />
          <Button onClick={handleCreateClick} className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Create New Customer Support
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex w-full flex-col">
          <div className="flex w-full gap-4 overflow-x-auto pb-4">
            <CustomerSupportKanban
              columns={STATUS_COLUMNS}
              columnData={columnData}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Single pagination for all columns - appears below all columns */}
          {needsPagination && (
            <div className="mt-8 flex w-full justify-center border-t border-gray-200 pt-6 dark:border-gray-700">
              <Pagination
                total={totalItems}
                current={page}
                pageSize={5}
                onChange={handlePageChange}
                showLessItems={true}
                prevIconClassName="py-0 text-gray-500 !leading-[26px]"
                nextIconClassName="py-0 text-gray-500 !leading-[26px]"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
