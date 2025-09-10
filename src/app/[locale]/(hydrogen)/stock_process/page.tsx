'use client';
import StockProcessTable from '@/app/shared/stock-process/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSearchParams } from 'next/navigation';
import { useStockProcessReport } from '@/framework/stock-process';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Stock Process',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'stockProcess',
    },
  ],
};

export default function StockProcessTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  //   params.set('role','Marchindaizer')
  const { data, isLoading } = useStockProcessReport(params.toString());
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
      fileName="benchmark_report"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <StockProcessTable
          data={data?.data?.processes}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
