'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import ActivityLogsTable from '@/app/shared/activity-logs/table';
import ActivityLogStatisticsCards from '@/app/shared/activity-logs/statistics-cards';
import { useActivityLogs } from '@/framework/activity-logs';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveActivityLogsPermissions } from '@/app/shared/activity-logs/permissions';
import {
  hasActiveActivityLogFilters,
  toActivityLogQuery,
} from '@/utils/activity-log-query';
import type { ActivityLog, ActivityLogListResponse } from '@/types/activity-log';

const pageHeader = {
  title: 'Activity Logs',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Activity Logs' },
  ],
};

export default function ActivityLogsPage() {
  const searchParams = useSearchParams();
  const { permissions } = usePermissions();
  const activityLogPermissions = resolveActivityLogsPermissions(permissions);

  const queryString = toActivityLogQuery(
    new URLSearchParams(searchParams.toString())
  );
  const { data, isLoading, isError, error, isFetching } = useActivityLogs(
    queryString,
    activityLogPermissions.view
  );

  const [selectedColumns, setSelectedColumns] = useState<unknown[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<unknown[]>([]);

  const listData = data as ActivityLogListResponse | undefined;
  const rows: ActivityLog[] = Array.isArray(listData?.data)
    ? (listData?.data as ActivityLog[])
    : [];
  const totalItems = listData?.meta?.total ?? 0;
  const hasFilters = hasActiveActivityLogFilters(
    new URLSearchParams(searchParams.toString())
  );

  if (!activityLogPermissions.view) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view activity logs.
      </div>
    );
  }

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column) =>
            String(column).replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="activity-logs"
      header="Date,User,Event,Description,Log Name"
      canExport={false}
      canCreate={false}
      canImport={false}
    >
      {isLoading ? (
        <div className="m-auto py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error?.message ?? 'Something went wrong loading activity logs.'}
        </div>
      ) : (
        <>
          <ActivityLogStatisticsCards statistics={listData?.statistics} />

          {totalItems === 0 && (
            <div className="mb-4 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {hasFilters || searchParams.get('search')
                  ? 'No activities match your filters.'
                  : 'No activity has been recorded yet.'}
              </Text>
              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {hasFilters || searchParams.get('search')
                  ? 'Use the Filters button to adjust or clear your filters.'
                  : 'Changes across the platform will appear here automatically.'}
              </Text>
            </div>
          )}

          <ActivityLogsTable
            data={rows}
            totalItems={totalItems}
            getSelectedColumns={setSelectedColumns}
            getSelectedRowKeys={setSelectedRowKeys}
          />

          {isFetching && !isLoading && (
            <Text className="mt-3 text-xs text-gray-500">Refreshing…</Text>
          )}
        </>
      )}
    </TableLayout>
  );
}
