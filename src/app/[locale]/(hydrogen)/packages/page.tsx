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
import { usePackages } from '@/framework/packages';
import CreateOrUpdatePackages from '@/app/shared/packages/packages-form';
import PackagesTable from '@/app/shared/packages/table';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Package Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Package',
    },
  ],
};

export default function CountriesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = usePackages(params.toString());
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
      fileName="packages/index"
      header="User,Created At"
      createName="Create packages"
      createElementButton={<CreateOrUpdatePackages />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <PackagesTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
