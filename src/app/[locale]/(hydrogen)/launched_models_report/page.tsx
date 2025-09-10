'use client';
import LaunchedModelTable from '@/app/shared/launched-model/tabel';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSearchParams } from 'next/navigation';
import { useLaunchedModelReport } from '@/framework/launched-model';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Launched Model Report',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Launched Model',
    },
  ],
};

export default function LaunchedModelTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useLaunchedModelReport(params.toString());
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
      fileName="launched_models_report"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <LaunchedModelTable
          data={data?.data?.items}
          setSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
