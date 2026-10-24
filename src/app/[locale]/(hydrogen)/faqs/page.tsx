'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import FaqForm from '@/app/shared/faqs/faq-form';
import FaqsTable from '@/app/shared/faqs/table';
import Spinner from '@/components/ui/spinner';
import { useFaqs } from '@/framework/faqs';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FaqsTablePage() {
  const { t } = useTranslation('faqs');
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');

  const { data, isLoading } = useFaqs();

  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const pageHeader = {
    title: t('faqs_page_title'),
    breadcrumb: [
      {
        href: '/',
        name: t('faqs_home'),
      },
      {
        name: t('faqs_page_title'),
      },
    ],
  };

  return (
    <>
      <>
        {
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
            fileName="Teams"
            header="User,Created At"
            createName={t('faqs_create')}
            createElementButton={<FaqForm />}
          >
            {isLoading ? (
              <div className="m-auto">
                <Spinner size="lg" />
              </div>
            ) : (
              <FaqsTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
              />
            )}
          </TableLayout>
        }
      </>
    </>
  );
}
