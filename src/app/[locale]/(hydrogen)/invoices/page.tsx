'use client';

import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
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

const pageHeader = {
  title: 'invoices',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'invoices' },
  ],
};

function normalizeZatcaRows(data: unknown): ZatcaInvoice[] {
  if (!data || typeof data !== 'object') return [];
  const payload = data as { data?: unknown };
  if (Array.isArray(payload.data)) return payload.data as ZatcaInvoice[];
  return [];
}

export default function InvoicesTablePage() {
  const searchParams = useSearchParams();
  const legacyParams = searchParams.toString();
  const zatcaQuery = toZatcaListQuery(new URLSearchParams(searchParams.toString()));

  const zatcaResult = useZatcaInvoices(zatcaQuery);
  const legacyResult = useInvoices(legacyParams);

  const showZatca = zatcaResult.isSuccess;
  const showLegacy = zatcaResult.isError;

  const [selectedColumns, setSelectedColumns] = useState<unknown[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<unknown[]>([]);

  const { permissions } = usePermissions();
  const { data: session } = useSession();
  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const zatcaPermissions = resolveZatcaPermissions(effectivePermissions);

  const canView =
    zatcaPermissions.view || effectivePermissions.includes('invoices');

  const zatcaRows = normalizeZatcaRows(zatcaResult.data);
  const zatcaTotal = zatcaResult.data?.meta?.total ?? 0;
  const isLoading =
    zatcaResult.isLoading || (showLegacy && legacyResult.isLoading);

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
      header={showZatca ? 'ZATCA Invoices' : 'Invoices'}
      createName="Create Invoice"
      createElementButton={<InvoiceForm />}
      customSize="750px"
      canCreate
      canExport={!showZatca}
    >
      {!canView ? (
        <Text className="p-8 text-center text-gray-600">
          You do not have permission to view invoices.
        </Text>
      ) : isLoading ? (
        <div className="m-auto py-16">
          <Spinner size="lg" />
        </div>
      ) : showZatca ? (
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
            statistics={legacyResult.data?.statistics}
            className="mb-6"
          />
          <InvoicesTable
            data={legacyResult.data?.data ?? []}
            getSelectedColumns={setSelectedColumns}
            getSelectedRowKeys={setSelectedRowKeys}
            totalItems={legacyResult.data?.meta?.total ?? 0}
          />
        </>
      )}
    </TableLayout>
  );
}
