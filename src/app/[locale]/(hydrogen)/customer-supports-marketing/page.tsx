'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import CreateOrUpdateCustomerSupport from '@/app/shared/customer-suport/suport-form';
import CustomerSuportTable from '@/app/shared/customer-suport/table';
import { useCustomerSupport } from '@/framework/customer-suport';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Customer Support',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Customer Support',
    },
  ],
};

export default function CountriesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  if (!params.get('type')) params.set('type', 'marketing');

  const { data, isLoading } = useCustomerSupport(params.toString());
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
      fileName="customer-supports-marketing"
      header="User,Created At"
      createName="Create Customer Support"
      createElementButton={<CreateOrUpdateCustomerSupport type="marketing" />}
      importButton="customer-supports/import"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <CustomerSuportTable
          data={data?.data}
          type="marketing"
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
