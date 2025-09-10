'use client';
import JourneysTable from '@/app/shared/journeys/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useJourneys } from '@/framework/journeys';
import Spinner from '@/components/ui/spinner';
import JourneysForm from '@/app/shared/journeys/journeys-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Journeys Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'journeys',
    },
  ],
};

export default function JourneysTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useJourneys(params.toString());
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
      fileName="journeys/index"
      header="User,Created At"
      createName="Create Journey"
      createElementButton={<JourneysForm />}
      importButton="import_journeys"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <JourneysTable
          data={data?.data?.journeys}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
