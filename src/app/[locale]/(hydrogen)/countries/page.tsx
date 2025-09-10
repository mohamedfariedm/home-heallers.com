'use client';
import RegionsTable from '@/app/shared/regions/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useRegions } from '@/framework/regions';
import Spinner from '@/components/ui/spinner';
import RegionForm from '@/app/shared/regions/region-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useCountries } from '@/framework/countrues';
import CountriesTable from '@/app/shared/countries/table';
import UpdateCreateCountries from '@/app/shared/countries/counties-form';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Country Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Country',
    },
  ],
};

export default function CountriesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useCountries(params.toString());
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
      fileName="Country/index"
      header="User,Created At"
      createName="Create Country"
      createElementButton={<UpdateCreateCountries />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <CountriesTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
