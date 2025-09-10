'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import PationtsTable from '@/app/shared/patients/table';
import { usePatients } from '@/framework/patients';
import CreateOrUpdatePationts from '@/app/shared/patients/pationts-form';
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
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = usePatients(params.toString());
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
      fileName="Patients/index"
      header="User,Created At"
      createName="Create Patients"
      createElementButton={<CreateOrUpdatePationts />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <PationtsTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
