'use client';
import SalesTable from '@/app/shared/sales/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSearchParams } from 'next/navigation';
import { useSalesReport } from '@/framework/sales';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Sales Report',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'sales',
    },
  ],
};

export default function SalesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useSalesReport(params.toString());
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
      fileName="sales/index"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <SalesTable
          data={data?.data?.sales}
          totalItems={data?.meta?.total}
          setSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
        />
      )}
    </TableLayout>
  );
}
