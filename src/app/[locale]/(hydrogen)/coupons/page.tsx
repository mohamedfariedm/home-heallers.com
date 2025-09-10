'use client';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useCoupons } from '@/framework/coupons';
import CreateOrUpdateCoupon from '@/app/shared/coupons/coupons-form';
import CouponsTable from '@/app/shared/coupons/table';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Coupons Management',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Coupons',
    },
  ],
};

export default function CouponsTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const { data, isLoading } = useCoupons(params.toString());
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
      fileName="Coupons/index"
      header="User,Created At"
      createName="Create Coupons"
      createElementButton={<CreateOrUpdateCoupon />}
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <CouponsTable
          data={data?.data}
          getSelectedColumns={setSelectedColumns}
          getSelectedRowKeys={setSelectedRowKeys}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
