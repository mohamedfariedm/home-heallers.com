'use client';
import CitiesTable from '@/app/shared/cities/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useCities } from '@/framework/cities';
import Spinner from '@/components/ui/spinner';
import CityForm from '@/app/shared/cities/city-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Cities Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'cities',
    },
  ],
};

export default function CitiesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useCities(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  console.log('selectedRowKeys', data);

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
      fileName="cities/index"
      header="User,Created At"
      createName="Create City"
      createElementButton={<CityForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <CitiesTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
