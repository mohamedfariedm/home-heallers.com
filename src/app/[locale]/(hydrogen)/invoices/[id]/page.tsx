'use client';

import PageHeader from '@/app/shared/page-header';
import InvoiceDetailView from '@/app/shared/zatca/invoice-detail-view';
import { resolveZatcaPermissions } from '@/app/shared/zatca/permissions';
import { usePermissions } from '@/context/PermissionsContext';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Text } from '@/components/ui/text';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const { permissions } = usePermissions();
  const { data: session } = useSession();
  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const zatcaPermissions = resolveZatcaPermissions(effectivePermissions);

  const canView =
    zatcaPermissions.view || effectivePermissions.includes('invoices');

  return (
    <>
      <PageHeader
        title="Invoice detail"
        breadcrumb={[
          { href: '/', name: 'Home' },
          { href: '/invoices', name: 'Invoices' },
          { href: '/invoices?tab=zatca', name: 'ZATCA' },
          { name: id },
        ]}
      />
      {!canView ? (
        <Text className="p-8 text-center text-gray-600">
          You do not have permission to view this invoice.
        </Text>
      ) : (
        <InvoiceDetailView invoiceId={id} permissions={zatcaPermissions} />
      )}
    </>
  );
}
