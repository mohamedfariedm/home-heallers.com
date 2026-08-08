import { keepPreviousData, useQuery } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import type {
  ActiveUserStats,
  AdminAnalyticsResponse,
  AppAnalyticsActiveUsersParams,
  AppAnalyticsDateRange,
  AppAnalyticsOverview,
} from '@/types/app-analytics';

export const appAnalyticsKeys = {
  overview: (params?: AppAnalyticsDateRange) =>
    [routes.appAnalytics.index, 'overview', params?.from ?? null, params?.to ?? null] as const,
  activeUsers: (params: AppAnalyticsActiveUsersParams) =>
    [
      routes.appAnalytics.index,
      'active-users',
      params.date ?? null,
      params.from ?? null,
      params.to ?? null,
    ] as const,
};

export function useAppAnalyticsOverview(
  enabled = true,
  params?: AppAnalyticsDateRange
) {
  return useQuery<AdminAnalyticsResponse<AppAnalyticsOverview>, Error>({
    queryKey: appAnalyticsKeys.overview(params),
    queryFn: () =>
      client.appAnalytics.overview(params) as Promise<
        AdminAnalyticsResponse<AppAnalyticsOverview>
      >,
    enabled,
  });
}

export function useAppAnalyticsActiveUsers(
  params: AppAnalyticsActiveUsersParams,
  enabled = true
) {
  const date = params.date ?? '';

  return useQuery<AdminAnalyticsResponse<ActiveUserStats>, Error>({
    queryKey: appAnalyticsKeys.activeUsers(params),
    queryFn: () =>
      client.appAnalytics.activeUsers(params) as Promise<
        AdminAnalyticsResponse<ActiveUserStats>
      >,
    enabled: enabled && Boolean(date),
    placeholderData: keepPreviousData,
  });
}
