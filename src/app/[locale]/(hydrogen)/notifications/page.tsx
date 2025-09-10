'use client';
import NotificationTable from '@/app/shared/notifications/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import NotificationForm from '@/app/shared/notifications/product-form';
import { useSearchParams } from 'next/navigation';
import { useNotifications } from '@/framework/notifications';
import { useState } from 'react';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Notifications Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Notifications Management',
    },
  ],
};

export default function ProductsTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useNotifications(params.toString());
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
      fileName="notifications/index"
      header="User,Created At"
      createName="Create Notification"
      createElementButton={<NotificationForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <NotificationTable
          data={data?.data?.notifications}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
