'use client';

import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { useSearchParams } from 'next/navigation';
import WithdrawalsTable from '@/app/shared/withdrawals/table';
import { useWithdrawalRequests } from '@/framework/withdrawals';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveWithdrawalsPermissions } from '@/app/shared/withdrawals/permissions';
import { Text } from '@/components/ui/text';

const pageHeader = {
  title: 'Withdrawal requests',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Withdrawals' },
  ],
};

export default function WithdrawalRequestsPage() {
  const searchParams = useSearchParams();
  const { permissions } = usePermissions();
  const withdrawalPermissions = resolveWithdrawalsPermissions(permissions);

  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    queryParams.set(key, value);
  });
  if (!queryParams.get('page')) queryParams.set('page', '1');
  if (!queryParams.get('per_page') && !queryParams.get('limit')) {
    queryParams.set('per_page', '10');
  }

  const { data, isLoading } = useWithdrawalRequests(queryParams.toString());

  if (!withdrawalPermissions.view) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        You do not have permission to manage withdrawal requests.
      </div>
    );
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? rows.length;

  return (
    <div className="space-y-4">
      <Text className="text-sm text-gray-600">
        Settle only after confirming the doctor was paid outside the platform.
        This dashboard never transfers bank funds.
      </Text>

      <TableLayout
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        data={{ columns: [], rows: [] }}
        fileName="Withdrawals/index"
        header="Doctor,Amount,Status"
        canCreate={false}
        canExport={false}
      >
        {isLoading ? (
          <div className="m-auto">
            <Spinner size="lg" />
          </div>
        ) : (
          <WithdrawalsTable
            data={rows}
            totalItems={total}
            permissions={withdrawalPermissions}
          />
        )}
      </TableLayout>
    </div>
  );
}
