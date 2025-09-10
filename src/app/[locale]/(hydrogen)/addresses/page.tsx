'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAddresses } from '@/framework/addresses';
import AddressForm from '@/app/shared/addresses/address-form';
import AddressesTable from '@/app/shared/addresses/table';

const pageHeader = {
  title: 'Addresses',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Addresses' },
  ],
};

export default function AddressesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');

  const { data, isLoading } = useAddresses(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns.filter((col) => col !== 'checked' && col !== 'action'),
        rows: selectedRowKeys,
      }}
      fileName="Addresses/index"
      header="Street,Created At"
      createName="Create Address"
      createElementButton={<AddressForm />}
    >
      {isLoading ? (
        <div className="m-auto"><Spinner size="lg" /></div>
      ) : (
        <AddressesTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
