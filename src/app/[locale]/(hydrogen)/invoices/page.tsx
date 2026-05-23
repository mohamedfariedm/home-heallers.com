'use client';

import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import InvoiceForm from '@/app/shared/invoices/invoices-form';
import InvoicesTable from '@/app/shared/invoices/table';
import InvoiceStatistics from '@/app/shared/invoices/invoice-statistics';
import ZatcaInvoicesTable from '@/app/shared/zatca/zatca-table';
import ZatcaExportButton from '@/app/shared/zatca/zatca-export-button';
import { useInvoices } from '@/framework/invoices';
import { useZatcaInvoices } from '@/framework/zatca';
import { resolveZatcaPermissions } from '@/app/shared/zatca/permissions';
import { usePermissions } from '@/context/PermissionsContext';
import { useSession } from 'next-auth/react';
import { toZatcaListQuery } from '@/utils/zatca-query';
import { Text } from '@/components/ui/text';
import type { ZatcaInvoice } from '@/types/zatca';
import cn from '@/utils/class-names';

const pageHeader = {
  title: 'invoices',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'invoices' },
  ],
};

type InvoiceView = 'management' | 'zatca';

function normalizeZatcaRows(data: unknown): ZatcaInvoice[] {
  if (!data || typeof data !== 'object') return [];
  const payload = data as { data?: unknown };
  if (Array.isArray(payload.data)) return payload.data as ZatcaInvoice[];
  return [];
}

export default function InvoicesTablePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeView: InvoiceView =
    searchParams.get('tab') === 'zatca' ? 'zatca' : 'management';

  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'tab') params.set(key, value);
  });
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');

  const { data, isLoading: legacyLoading } = useInvoices(params.toString());
  const zatcaQuery = toZatcaListQuery(new URLSearchParams(params.toString()));
  const { data: zatcaData, isLoading: zatcaLoading } = useZatcaInvoices(
    zatcaQuery,
    activeView === 'zatca'
  );

  const [selectedColumns, setSelectedColumns] = useState<unknown[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<unknown[]>([]);

  const { permissions } = usePermissions();
  const { data: session } = useSession();
  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const zatcaPermissions = resolveZatcaPermissions(effectivePermissions);

  const canViewInvoices = effectivePermissions.includes('invoices');
  const canViewZatca = zatcaPermissions.view;
  const showZatcaTab = canViewZatca;

  const setView = (view: InvoiceView) => {
    const next = new URLSearchParams(searchParams.toString());
    if (view === 'zatca') next.set('tab', 'zatca');
    else next.delete('tab');
    next.set('page', '1');
    router.push(`${pathname}?${next.toString()}`);
  };

  const zatcaRows = normalizeZatcaRows(zatcaData);
  const zatcaTotal = zatcaData?.meta?.total ?? 0;
  const isLoading = activeView === 'zatca' ? zatcaLoading : legacyLoading;

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns.filter(
          (col) => col !== 'checked' && col !== 'action'
        ),
        rows: selectedRowKeys,
      }}
      fileName="invoices"
      header="invoices"
      createName="Create Invoice"
      createElementButton={<InvoiceForm />}
      customSize="750px"
      canCreate
      canExport={activeView === 'management'}
    >
      {!canViewInvoices && !canViewZatca ? (
        <Text className="p-8 text-center text-gray-600">
          You do not have permission to view invoices.
        </Text>
      ) : (
        <>
          {showZatcaTab && (
            <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
              <Button
                variant={activeView === 'management' ? 'solid' : 'outline'}
                onClick={() => setView('management')}
                className={cn(
                  activeView === 'management' &&
                    'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                )}
              >
                Invoice management
              </Button>
              <Button
                variant={activeView === 'zatca' ? 'solid' : 'outline'}
                onClick={() => setView('zatca')}
                className={cn(
                  activeView === 'zatca' &&
                    'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                )}
              >
                ZATCA compliance
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="m-auto py-16">
              <Spinner size="lg" />
            </div>
          ) : activeView === 'zatca' && showZatcaTab ? (
            <>
              <div className="mb-4 flex justify-end">
                {zatcaPermissions.export && (
                  <ZatcaExportButton disabled={zatcaTotal === 0} />
                )}
              </div>
              <ZatcaInvoicesTable
                data={zatcaRows}
                totalItems={zatcaTotal}
                permissions={zatcaPermissions}
                getSelectedColumns={setSelectedColumns}
                getSelectedRowKeys={setSelectedRowKeys}
              />
            </>
          ) : (
            <>
              <InvoiceStatistics
                statistics={data?.statistics}
                className="mb-6"
              />
              <InvoicesTable
                data={data?.data ?? []}
                getSelectedColumns={setSelectedColumns}
                getSelectedRowKeys={setSelectedRowKeys}
                totalItems={data?.meta?.total ?? 0}
                zatcaPermissions={zatcaPermissions}
              />
            </>
          )}
        </>
      )}
    </TableLayout>
  );
}
