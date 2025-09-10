'use client';
import StoresTable from '@/app/shared/stores/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useStores } from '@/framework/stores';
import Spinner from '@/components/ui/spinner';
import StoreForm from '@/app/shared/stores/store-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Store Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'store',
    },
  ],
};

export default function StoreTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useStores(params.toString());
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
      fileName="stores/index"
      header="User,Created At"
      createName="Create Store"
      createElementButton={<StoreForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <StoresTable
          data={data?.data?.stores}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
