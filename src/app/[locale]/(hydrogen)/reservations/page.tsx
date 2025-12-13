'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ReservationsTable from '@/app/shared/reservations/table';
import { useReservations } from '@/framework/reservations';
import CreateOrUpdateReservation from '@/app/shared/reservations/reservations-form';

const pageHeader = {
  title: 'Reservations',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Reservations',
    },
  ],
};

export default function ReservationsTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  
  const { data, isLoading } = useReservations(params.toString());
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
      fileName="reservations"
      header="Client,Created At"
      createName="Create Reservation"
      createElementButton={<CreateOrUpdateReservation />}
      importButton="reservations/import"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <ReservationsTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}