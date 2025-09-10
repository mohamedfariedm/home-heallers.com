'use client';
import RetailersTable from '@/app/shared/retailers/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useRetailers } from '@/framework/retailers';
import Spinner from '@/components/ui/spinner';
import RetailerForm from '@/app/shared/retailers/retailer-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Retailers Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'retailers',
    },
  ],
};

export default function RetailersTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useRetailers(params.toString());
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
      fileName="retailers/index"
      header="User,Created At"
      createName="Create Retailer"
      createElementButton={<RetailerForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <RetailersTable
          data={data?.data?.retailers}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
