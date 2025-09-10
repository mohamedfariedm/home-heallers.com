'use client';
import SalesTargetTable from '@/app/shared/sales-target-table/table';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import { useSalesTargetTableReport } from '@/framework/sales-target-chart';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
// export const metadata = {
//   ...metaObject('Enhanced Table'),
// };

const pageHeader = {
  title: 'Sales Target Table',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Sales target Table',
    },
  ],
};

export default function SalesTargetTablePage() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  if (!params.get('page')) params.set('page', '1');
  if (!params.get('limit')) params.set('limit', '10');
  const type = params.get('chart_type') || 'weekly';
  params.set('chart_type', type);
  const { data, isLoading } = useSalesTargetTableReport(
    type,
    params.toString()
  );

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={data?.data?.targets}
      fileName="invoice_data"
      header="User,Created At"
    >
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <SalesTargetTable
          data={data?.data?.targets}
          achieved_target={data?.data?.achieved_target}
          remaining_target={data?.data?.remaining_target}
          target_category={data?.data?.target_category}
          totalItems={data?.meta?.total}
        />
      )}
    </TableLayout>
  );
}
