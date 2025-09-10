'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import CreateOrUpdateState from '@/app/shared/states/states-form';
import StatesTable from '@/app/shared/states/table';
import Spinner from '@/components/ui/spinner';
import { useStates } from '@/framework/states';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'States Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'States',
    },
  ],
};

export default function CitiesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useStates(params.toString());
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
      fileName="states/index"
      header="User,Created At"
      createName="Create State"
      createElementButton={<CreateOrUpdateState />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <StatesTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
