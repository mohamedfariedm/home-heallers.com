'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import UserActivitySummaryPanel from '@/app/shared/user-activity-reports/summary-panel';
import UserActivityRecordsList from '@/app/shared/user-activity-reports/records-list';
import { useUserActivityReportDetail } from '@/framework/user-activity-reports';
import { resolveKpisPermissions } from '@/app/shared/kpis/permissions';
import { usePermissions } from '@/context/PermissionsContext';
import { toUserActivityQuery } from '@/utils/user-activity-query';
import { routes } from '@/config/routes';
import type { UserActivityDetailResponse } from '@/types/user-activity-report';

export default function UserKpiDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { permissions } = usePermissions();
  const { data: session } = useSession();

  const userId = Number(params.userId);
  const locale = String(params.locale ?? 'en');

  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const kpisPermissions = resolveKpisPermissions(effectivePermissions);

  const queryString = toUserActivityQuery(
    new URLSearchParams(searchParams.toString()),
    { forDetail: true }
  );

  const { data, isLoading, isError, error, isFetching } =
    useUserActivityReportDetail(userId, queryString, kpisPermissions.viewUsers);

  const detail = (data as UserActivityDetailResponse | undefined)?.data;
  const records = detail?.records ?? [];
  const totalItems =
    (data as UserActivityDetailResponse | undefined)?.meta?.total ?? 0;

  const pageHeader = {
    title: detail?.user?.name ?? 'User Activity',
    breadcrumb: [
      { href: '/', name: 'Home' },
      {
        href: `/${locale}${routes.kpis.index}?tab=users`,
        name: 'KPIs',
      },
      { name: detail?.user?.name ?? 'User Detail' },
    ],
  };

  if (!kpisPermissions.viewUsers) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view user KPI reports.
      </div>
    );
  }

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{ columns: [], rows: [] }}
      fileName="user-activity-records"
      header="Model,Actions,Activities"
      canExport={false}
      canCreate={false}
      canImport={false}
    >
      <div className="@container space-y-6">
        <Link
          href={`/${locale}${routes.kpis.index}?tab=users`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to User KPIs
        </Link>

      {isLoading ? (
        <div className="m-auto py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error?.message ?? 'Failed to load user activity detail.'}
        </div>
      ) : !detail ? (
        <Text className="text-gray-500">User activity not found.</Text>
      ) : (
        <>
          <UserActivitySummaryPanel user={detail.user} summary={detail.summary} />

          <UserActivityRecordsList records={records} totalItems={totalItems} />

          {isFetching && !isLoading && (
            <Text className="mt-3 text-xs text-gray-500">Refreshing…</Text>
          )}
        </>
      )}
      </div>
    </TableLayout>
  );
}
