'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import {
  useAppAnalyticsActiveUsers,
  useAppAnalyticsOverview,
} from '@/framework/app-analytics';
import { usePermissions } from '@/context/PermissionsContext';
import {
  getMockActiveUsers,
  getMockAppAnalyticsOverview,
  isAppAnalyticsEmpty,
} from '@/data/app-analytics-mock';
import AppAnalyticsStatCards from './stat-cards';
import AppAnalyticsCharts from './charts';
import OutdatedInstallationsTable from './outdated-installations-table';

function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export default function AppAnalyticsDashboard() {
  const { permissions } = usePermissions();
  const canView = permissions.includes('app_analytics');
  const [selectedDate, setSelectedDate] = useState('');

  const {
    data: overviewResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useAppAnalyticsOverview(canView);

  const effectiveDate =
    selectedDate || overviewResponse?.data?.active_users?.date || toDateInputValue();

  const usingMockData =
    Boolean(overviewResponse?.data) && isAppAnalyticsEmpty(overviewResponse.data);

  const { data: activeUsersResponse, isFetching: isActiveUsersFetching } =
    useAppAnalyticsActiveUsers(
      effectiveDate,
      canView && Boolean(effectiveDate) && !usingMockData
    );

  if (!canView) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view app analytics.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (isError || !overviewResponse?.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Error loading app analytics</p>
          <p className="mt-2 text-sm text-gray-500">
            {error?.message || 'Failed to fetch analytics data'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overview = usingMockData
    ? getMockAppAnalyticsOverview(effectiveDate)
    : overviewResponse.data;

  const activeUsers = usingMockData
    ? getMockActiveUsers(effectiveDate)
    : activeUsersResponse?.data ?? overview.active_users;

  return (
    <div className="@container space-y-8">
      {/* <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 @xl:text-3xl dark:text-white">
            App Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mobile installation, device, and active-user metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Active users date
          </label>
          <Input
            type="date"
            value={effectiveDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-44"
            inputClassName="border-gray-200 dark:border-gray-700 rounded-lg h-9 text-sm"
          />
          {isActiveUsersFetching && <Loader size="sm" />}
        </div>
      </div> */}

      {usingMockData && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          Preview data — live app analytics is not available yet. These numbers are sample
          data so you can review the dashboard layout.
        </div>
      )}

      <AppAnalyticsStatCards data={overview} activeUsers={activeUsers} />
      <AppAnalyticsCharts data={overview} />
      <OutdatedInstallationsTable
        count={overview.devices.should_update.count}
        items={overview.devices.should_update.items}
      />
    </div>
  );
}
