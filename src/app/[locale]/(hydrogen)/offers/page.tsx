'use client';

import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { usePackages } from '@/framework/packages';
import OffersTable from '@/app/shared/offers/table';
import OffersExportButton from '@/app/shared/offers/export-button';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveOffersPermissions } from '@/app/shared/offers/permissions';
import { routes } from '@/config/routes';
import { OFFER_PAGE_SIZE_KEY, OFFER_PAGE_SIZES } from '@/types/offer';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { PiArrowClockwise } from 'react-icons/pi';

const pageHeader = {
  title: 'Offers',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Offers' },
  ],
};

function defaultLimit() {
  if (typeof window === 'undefined') return '25';
  const stored = Number(window.localStorage.getItem(OFFER_PAGE_SIZE_KEY));
  return (OFFER_PAGE_SIZES as readonly number[]).includes(stored)
    ? String(stored)
    : '25';
}

export default function OffersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { permissions } = usePermissions();
  const access = resolveOffersPermissions(permissions);
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (params.get('type') !== 'offer') {
      params.set('type', 'offer');
      changed = true;
    }
    if (!params.get('page')) {
      params.set('page', '1');
      changed = true;
    }
    if (!params.get('limit')) {
      params.set('limit', defaultLimit());
      changed = true;
    }
    if (changed) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', 'offer');
    if (!params.get('page')) params.set('page', '1');
    if (!params.get('limit')) params.set('limit', defaultLimit());
    return params.toString();
  }, [searchParams]);

  const { data, isLoading, isFetching, error, refetch } = usePackages(queryString);
  const status = (error as any)?.response?.status;

  if (!access.view) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to view offers
      </div>
    );
  }

  if (status === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You don&apos;t have permission to view offers
      </div>
    );
  }

  if (error && status !== 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6">
        <Text>Could not load offers.</Text>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? 0;

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: String) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="packages"
      header="excel"
      createName="New Offer"
      createHref={access.create ? routes.offers.create : undefined}
      canCreate={access.create}
      canExport={access.export}
      canImport={false}
      exportElement={
        <div className="flex w-full flex-col gap-3 @lg:w-auto @lg:flex-row">
          {/* <Button variant="outline" onClick={() => refetch()} className="w-full @lg:w-auto">
            <PiArrowClockwise className="me-1.5 h-[17px] w-[17px]" />
            Refresh
          </Button> */}
          <OffersExportButton total={total} />
        </div>
      }
    >
      {isLoading ? (
        <div className="m-auto py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <OffersTable
          data={rows}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={total}
          isFetching={isFetching && !isLoading}
          canDelete={access.delete}
        />
      )}
    </TableLayout>
  );
}
