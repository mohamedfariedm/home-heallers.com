'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import InvoiceView from '@/components/ui/invoiceView';
import { useInvoices } from '@/framework/invoices';
import InvoiceForm from '@/app/shared/invoices/invoices-form';
import InvoicesTable from '@/app/shared/invoices/table';

const pageHeader = {
  title: 'invoices',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'invoices' },
  ],
};

export default function InvoicesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');

  const { data, isLoading } = useInvoices(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
console.log(data);

  return (
    <>
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns.filter((col) => col !== 'checked' && col !== 'action'),
        rows: selectedRowKeys,
      }}
      fileName="invoices"
      header="Street,Created At"
      createName="Create Invoice"
      createElementButton={<InvoiceForm />}
      customSize='750px'
    >
      {isLoading ? (
        <div className="m-auto"><Spinner size="lg" /></div>
      ) : (
        <InvoicesTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>

    </>
  );
}
