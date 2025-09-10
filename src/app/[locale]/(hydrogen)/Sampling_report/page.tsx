'use client';
import SamplingModelTable from '@/app/shared/Sampling_report/tabel';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSearchParams } from 'next/navigation';
import { useSimplingReport } from '@/framework/simpling';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Sampling Report',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Sampling Report',
    },
  ],
};

export default function SamplingModelTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useSimplingReport(params.toString());
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
      fileName="Sampling_report"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <SamplingModelTable
          data={data?.data?.items}
          totalItems={data?.meta?.total}
          setSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
        />
      )}
    </TableLayout>
  );
}
