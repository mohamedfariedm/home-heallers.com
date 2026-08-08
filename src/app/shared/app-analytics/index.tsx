'use client';

import { useState } from 'react';
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
import AppAnalyticsFiltersComponent, {
  type AppAnalyticsFilters,
} from './filters';
import AppAnalyticsStatCards from './stat-cards';
import AppAnalyticsCharts from './charts';
import OutdatedInstallationsTable from './outdated-installations-table';

function toDateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export default function AppAnalyticsDashboard() {
  const { permissions } = usePermissions();
  const canView = permissions.includes('app_analytics');
  const [filters, setFilters] = useState<AppAnalyticsFilters>({});

  const dateRange =
    filters.from || filters.to
      ? {
          ...(filters.from ? { from: filters.from } : {}),
          ...(filters.to ? { to: filters.to } : {}),
        }
      : undefined;

  const {
    data: overviewResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useAppAnalyticsOverview(canView, dateRange);

  const effectiveDate =
    filters.date || overviewResponse?.data?.active_users?.date || toDateInputValue();

  const usingMockData =
    Boolean(overviewResponse?.data) && isAppAnalyticsEmpty(overviewResponse.data);

  const {
    data: activeUsersResponse,
    isFetching: isActiveUsersFetching,
    isError: isActiveUsersError,
    error: activeUsersError,
  } = useAppAnalyticsActiveUsers(
    {
      date: effectiveDate,
      ...(dateRange ?? {}),
    },
    canView && Boolean(effectiveDate) && !usingMockData
  );

  const handleFilter = (newFilters: AppAnalyticsFilters) => {
    setFilters(newFilters);
  };

  if (!canView) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view app analytics.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AppAnalyticsFiltersComponent onFilter={handleFilter} />
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="xl" />
        </div>
      </div>
    );
  }

  if (isError || !overviewResponse?.data) {
    return (
      <div className="space-y-6">
        <AppAnalyticsFiltersComponent onFilter={handleFilter} />
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
      <AppAnalyticsFiltersComponent onFilter={handleFilter} className="mb-2" />

      {usingMockData && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          Waiting for app data — live analytics counts are still zero. Showing sample
          data so you can review the dashboard layout.
        </div>
      )}

      {!usingMockData && isActiveUsersError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          {activeUsersError?.message ||
            'Invalid date for active user metrics. Please choose a valid date.'}
        </div>
      )}

      {!usingMockData && isActiveUsersFetching && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader size="sm" />
          Updating active user metrics…
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
