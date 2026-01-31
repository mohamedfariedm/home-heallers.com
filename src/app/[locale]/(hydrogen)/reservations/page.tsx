'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ReservationsTable from '@/app/shared/reservations/table';
import { useReservations } from '@/framework/reservations';
import CreateOrUpdateReservation from '@/app/shared/reservations/reservations-form';
import ReservationStatistics from '@/app/shared/reservations/reservation-statistics';

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
  
  // Build query string from search params
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    queryParams.set(key, value);
  });
  if (!queryParams.get('page')) queryParams.set('page', '1');
  if (!queryParams.get('limit')) queryParams.set('limit', '10');
  queryParams.set('include_statistics', 'true');
  
  const { data, isLoading } = useReservations(queryParams.toString());
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
        <>
          {/* Reservation Statistics */}
          <ReservationStatistics 
            statistics={data?.statistics} 
            className="mb-6"
          />
          
          {/* Reservations Table */}
          <ReservationsTable
            data={data?.data}
            getSelectedColumns={setSelectedColumns}
            getSelectedRowKeys={setSelectedRowKeys}
            totalItems={data?.meta?.total}
          />
        </>
      )}
    </TableLayout>
  );
}