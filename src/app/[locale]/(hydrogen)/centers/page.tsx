'use client';
import CentersTable from '@/app/shared/centers/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useCenters } from '@/framework/centers';
import Spinner from '@/components/ui/spinner';
import CenterForm from '@/app/shared/centers/center-form';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const pageHeader = {
  title: 'Centers Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Centers',
    },
  ],
};

export default function CentersTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useCenters(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
console.log('data', data);
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
      fileName="centers/index"
      header="Name,Phone,Email,Status,Created At"
      createName="Create Center"
      createElementButton={<CenterForm />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <CentersTable
          data={data?.data || []}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total || 0}
        />
      )}
    </TableLayout>
  );
}
