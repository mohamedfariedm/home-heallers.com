'use client';
import StockTable from '@/app/shared/stock/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import CreateStock from '@/app/shared/stock/stock-form';
import { useStocks } from '@/framework/stock';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Stock Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'stock',
    },
  ],
};

export default function StockTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useStocks(params.toString());
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
      fileName="stock/index"
      header="Role,Created At"
      createName="Create Stock"
      createElementButton={<CreateStock />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <StockTable
          data={data?.data?.stock}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
