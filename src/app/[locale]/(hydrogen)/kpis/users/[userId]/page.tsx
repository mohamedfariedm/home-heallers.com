'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import UserActivityTimelineTable from '@/app/shared/user-activity-reports/timeline-table';
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
    new URLSearchParams(searchParams.toString())
  );

  const { data, isLoading, isError, error, isFetching } =
    useUserActivityReportDetail(userId, queryString, kpisPermissions.viewUsers);

  const detail = (data as UserActivityDetailResponse | undefined)?.data;
  const timeline = detail?.timeline ?? [];
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
      fileName="user-activity-timeline"
      header="Date,Event,Description,Log Name"
      canExport={false}
      canCreate={false}
      canImport={false}
    >
      <div className="mb-4">
        <Link
          href={`/${locale}${routes.kpis.index}?tab=users`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to User KPIs
        </Link>
      </div>

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
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <AvatarCard
                src=""
                name={detail.user.name}
                description={detail.user.email ?? undefined}
                avatarProps={{
                  name: detail.user.name,
                  className: '!bg-gray-200 !text-gray-700',
                }}
              />
              <div className="flex flex-wrap gap-2">
                {detail.user.roles.map((role) => (
                  <Badge key={role} variant="flat" color="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              <SummaryStat label="Total Actions" value={detail.summary.total_actions} />
              <SummaryStat label="Today" value={detail.summary.today} />
              <SummaryStat label="This Week" value={detail.summary.this_week} />
              <SummaryStat label="This Month" value={detail.summary.this_month} />
              <SummaryStat label="Active Days" value={detail.summary.active_days} />
              <div>
                <Text className="text-xs text-gray-500">Last Activity</Text>
                <Text className="font-semibold">
                  {detail.summary.last_activity_at ? (
                    <DateCell date={new Date(detail.summary.last_activity_at)} />
                  ) : (
                    '—'
                  )}
                </Text>
              </div>
            </div>
          </div>

          <Text className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Activity Timeline ({totalItems} actions)
          </Text>

          {totalItems === 0 ? (
            <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                No actions match the current filters.
              </Text>
            </div>
          ) : (
            <UserActivityTimelineTable data={timeline} totalItems={totalItems} />
          )}

          {isFetching && !isLoading && (
            <Text className="mt-3 text-xs text-gray-500">Refreshing…</Text>
          )}
        </>
      )}
    </TableLayout>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Text className="text-xs text-gray-500">{label}</Text>
      <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </Text>
    </div>
  );
}
