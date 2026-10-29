'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import PationtsTable from '@/app/shared/patients/table';
import ClientStatistics from '@/app/shared/patients/client-statistics';
import { usePatients } from '@/framework/patients';
import CreateOrUpdatePationts from '@/app/shared/patients/pationts-form';
import { usePermissions } from '@/context/PermissionsContext';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Patients',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Patients',
    },
  ],
};

export default function PatientsTablePage() {
  const searchParams = useSearchParams();
  const { permissions } = usePermissions();
  const canManageCoupons = permissions.includes('coupons');
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    queryParams.set(key, value);
  });
  if (!queryParams.get('page')) queryParams.set('page', '1');
  if (!queryParams.get('limit')) queryParams.set('limit', '10');
  queryParams.set('include_statistics', 'true');
  const { data, isLoading } = usePatients(queryParams.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
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
      fileName="clients"
      header="User,Created At"
      createName="Create Patients"
      createElementButton={<CreateOrUpdatePationts />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <ClientStatistics statistics={data?.statistics} className="mb-6" />
          <PationtsTable
            data={data?.data}
            getSelectedColumns={setSelectedColumns}
            getSelectedRowKeys={setSelectedRowKeys}
            totalItems={data?.meta?.total}
            canPersonalCoupons={canManageCoupons}
          />
        </>
      )}
    </TableLayout>
  );
}
