'use client';
import NewInstalledPOSMTable from '@/app/shared/new-installed-POSM/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSearchParams } from 'next/navigation';
import { useNewInstalledPOSMReport } from '@/framework/new-installed-POSM';
import Spinner from '@/components/ui/spinner';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'New Installed POSM Report',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'New Installed POSM',
    },
  ],
};

export default function NewInstalledPOSMTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useNewInstalledPOSMReport(params.toString());
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
      fileName="NewInstalledPOSM_report"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <NewInstalledPOSMTable
          totalItems={data?.meta?.total}
          data={data?.data?.items}
          setSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
        />
      )}
    </TableLayout>
  );
}
