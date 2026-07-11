import { keepPreviousData, useQuery } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import type {
  ActiveUserStats,
  AdminAnalyticsResponse,
  AppAnalyticsOverview,
} from '@/types/app-analytics';

export const appAnalyticsKeys = {
  overview: () => [routes.appAnalytics.index, 'overview'] as const,
  activeUsers: (date: string) =>
    [routes.appAnalytics.index, 'active-users', date] as const,
};

export function useAppAnalyticsOverview(enabled = true) {
  return useQuery<AdminAnalyticsResponse<AppAnalyticsOverview>, Error>({
    queryKey: appAnalyticsKeys.overview(),
    queryFn: () =>
      client.appAnalytics.overview() as Promise<
        AdminAnalyticsResponse<AppAnalyticsOverview>
      >,
    enabled,
  });
}

export function useAppAnalyticsActiveUsers(date: string, enabled = true) {
  return useQuery<AdminAnalyticsResponse<ActiveUserStats>, Error>({
    queryKey: appAnalyticsKeys.activeUsers(date),
    queryFn: () =>
      client.appAnalytics.activeUsers(date) as Promise<
        AdminAnalyticsResponse<ActiveUserStats>
      >,
    enabled: enabled && Boolean(date),
    placeholderData: keepPreviousData,
  });
}
