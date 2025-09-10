'use client';
import NewInstalledSoftPOSMTable from '@/app/shared/new-installed-soft-POSM/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/ui/spinner';
import { useNewInstalledSoftPOSMReport } from '@/framework/new-installed-soft-POSM';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'New Installed Soft POSM Report',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'New Installed Soft POSM Report',
    },
  ],
};

export default function NewInstalledSoftPOSMTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useNewInstalledSoftPOSMReport(params.toString());
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
      fileName="NewInstalledSoftPOSM_report"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <NewInstalledSoftPOSMTable
          data={data?.data?.items}
          totalItems={data?.meta?.total}
          setSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
        />
      )}
    </TableLayout>
  );
}
