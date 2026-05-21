'use client';

import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import InvoiceForm from '@/app/shared/invoices/invoices-form';
import ZatcaInvoicesTable from '@/app/shared/zatca/zatca-table';
import ZatcaExportButton from '@/app/shared/zatca/zatca-export-button';
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

export default function InvoicesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const query = toZatcaListQuery(params);

  const { data, isLoading } = useZatcaInvoices(query);
  const [selectedColumns, setSelectedColumns] = useState<unknown[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<unknown[]>([]);

  const { permissions } = usePermissions();
  const { data: session } = useSession();
  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const zatcaPermissions = resolveZatcaPermissions(effectivePermissions);

  const canView =
    zatcaPermissions.view || effectivePermissions.includes('invoices');
  const rows = (data?.data ?? []) as ZatcaInvoice[];
  const total = data?.meta?.total ?? 0;

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
      header="ZATCA Invoices"
      createName={zatcaPermissions.submit ? 'Create Invoice' : undefined}
      createElementButton={zatcaPermissions.submit ? <InvoiceForm /> : undefined}
      customSize="750px"
      canCreate={zatcaPermissions.submit}
      canExport={false}
    >
      {!canView ? (
        <Text className="p-8 text-center text-gray-600">
          You do not have permission to view invoices.
        </Text>
      ) : isLoading ? (
        <div className="m-auto py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            {zatcaPermissions.export && (
              <ZatcaExportButton disabled={total === 0} />
            )}
          </div>
          <ZatcaInvoicesTable
            data={rows}
            totalItems={total}
            permissions={zatcaPermissions}
            getSelectedColumns={setSelectedColumns}
            getSelectedRowKeys={setSelectedRowKeys}
          />
        </>
      )}
    </TableLayout>
  );
}
