'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import DoctorsTable from '@/app/shared/doctors/table';
import { useDoctors } from '@/framework/doctors';
import CreateOrUpdateDoctors from '@/app/shared/doctors/doctors-form';

const pageHeader = {
  title: 'Doctors',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Doctors',
    },
  ],
};

export default function DoctorsTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  
  const { data, isLoading } = useDoctors(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  console.log('selectedRowKeys', data?.data);
  
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
      fileName="Doctors/index"
      header="Doctor,Created At"
      createName="Create Doctor"
      createElementButton={<CreateOrUpdateDoctors />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <DoctorsTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}