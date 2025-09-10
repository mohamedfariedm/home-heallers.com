'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useBlogs } from '@/framework/blog';
import BlogsForm from '@/app/shared/blogs/address-form';
import BlogTable from '@/app/shared/blogs/table';
import InvoiceView from '@/components/ui/invoiceView';

const pageHeader = {
  title: 'Blogs',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Blogs' },
  ],
};

export default function AddressesTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');

  const { data, isLoading } = useBlogs(params.toString());
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
      fileName="Blogs/index"
      header="Street,Created At"
      createName="Create Blog"
      createElementButton={<BlogsForm />}
    >
      {isLoading ? (
        <div className="m-auto"><Spinner size="lg" /></div>
      ) : (
        <BlogTable
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
