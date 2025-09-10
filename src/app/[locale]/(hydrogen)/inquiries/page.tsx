'use client';
import InqueriesTable from '@/app/shared/inqueries/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useInquery } from '@/framework/inqueries';
import Spinner from '@/components/ui/spinner';
import InqueriesForm from '@/app/shared/inqueries/inqueries-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Inquiries Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Inquiries',
    },
  ],
};

export default function InquiriesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useInquery(params.toString());
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
      fileName="inquiries/index"
      header="User,Created At"
      createElementButton={<InqueriesForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <InqueriesTable
          data={data?.data?.inquiries}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
