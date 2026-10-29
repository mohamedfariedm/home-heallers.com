'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import DoctorsTable from '@/app/shared/doctors/table';
import { useDoctors } from '@/framework/doctors';
import CreateOrUpdateDoctors from '@/app/shared/doctors/doctors-form';
import DoctorsBulkPrice from '@/app/shared/doctors/doctors-bulk-price';
import CreateButton from '@/app/shared/create-button';
import { PiCurrencyCircleDollarBold } from 'react-icons/pi';

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
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    queryParams.set(key, value);
  });
  if (!queryParams.get('page')) queryParams.set('page', '1');
  if (!queryParams.get('limit')) queryParams.set('limit', '10');

  const { data, isLoading } = useDoctors(queryParams.toString());
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
      fileName="doctors"
      header="Doctor,Created At"
      createName="Create Doctor"
      createElementButton={<CreateOrUpdateDoctors />}
      headerActions={
        <CreateButton
          label="Bulk price"
          icon={<PiCurrencyCircleDollarBold className="me-1.5 h-[17px] w-[17px]" />}
          view={<DoctorsBulkPrice />}
          variant="outline"
          className="mt-0 w-full text-xs capitalize @lg:w-auto sm:text-sm lg:mt-0"
          disabled={isLoading}
          customSize="600px"
        />
      }
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