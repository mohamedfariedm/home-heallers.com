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

  // Sync page state with URL params
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 5);
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [searchParams, page]);

  // Fetch data for each column separately with the same page
  const newParams = new URLSearchParams();
  newParams.set('page', String(page));
  newParams.set('limit', '5');
  newParams.set('type', 'operation');
  newParams.set('status_equal', 'new');
  const newData = useCustomerSupport(newParams.toString());

  const failedParams = new URLSearchParams();
  failedParams.set('page', String(page));
  failedParams.set('limit', '5');
  failedParams.set('type', 'operation');
  failedParams.set('status_equal', 'failed');
  const failedData = useCustomerSupport(failedParams.toString());

  const successParams = new URLSearchParams();
  successParams.set('page', String(page));
  successParams.set('limit', '5');
  successParams.set('type', 'operation');
  successParams.set('status_equal', 'success');
  const successData = useCustomerSupport(successParams.toString());

  const possibleParams = new URLSearchParams();
  possibleParams.set('page', String(page));
  possibleParams.set('limit', '5');
  possibleParams.set('type', 'operation');
  possibleParams.set('status_equal', 'possible');
  const possibleData = useCustomerSupport(possibleParams.toString());

  const negotiationParams = new URLSearchParams();
  negotiationParams.set('page', String(page));
  negotiationParams.set('limit', '5');
  negotiationParams.set('type', 'operation');
  negotiationParams.set('status_equal', 'negotiation');
  const negotiationData = useCustomerSupport(negotiationParams.toString());

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
        <Button
          onClick={handleCreateClick}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
          Create New Customer Support
        </Button>
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
