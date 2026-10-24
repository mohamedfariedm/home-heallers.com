'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlogs } from '@/framework/blog';
import BlogsForm from '@/app/shared/blogs/address-form';
import BlogTable from '@/app/shared/blogs/table';

export default function AddressesTablePage() {
  const { t } = useTranslation('blogs');
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');

  const { data, isLoading } = useBlogs(params.toString());
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const pageHeader = {
    title: t('blogs_page_title'),
    breadcrumb: [
      { href: '/', name: t('blogs_home') },
      { name: t('blogs_page_title') },
    ],
  };

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
      createName={t('blogs_create')}
      createElementButton={<BlogsForm />}
      customSize="800px"
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
