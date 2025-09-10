'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import * as tr from '@/app/[locale]/dictionaries/index';
import ClientForm from '@/app/shared/client-review/review-form';
import ClientReview from '@/app/shared/client-review/table';
import Spinner from '@/components/ui/spinner';
import { useClientReview } from '@/framework/client-review';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ClientReviewPage({
  params: { locale },
}: {
  params: { locale: any };
}) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useClientReview();
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const text = String(locale) == 'ar' ? tr['ar'] : tr['en'];
  const pageHeader = {
    title: `Client Review`,
    breadcrumb: [
      {
        href: '/',
        name: ` Home`,
      },
      {
        name: `Client Review`,
      },
    ],
  };
  console.log(data);

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
       fileName="review/index"
       header="User,Created At"
       createName="Create Review"
       createElementButton={<ClientForm />}
          >
            {isLoading ? (
              <div className="m-auto">
                <Spinner size="lg" />
              </div>
            ) : (
              <ClientReview
                data={data?.data || []}
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
