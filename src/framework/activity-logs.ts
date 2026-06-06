import { keepPreviousData, useQuery } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import type {
  ActivityLogFilterOptions,
  ActivityLogListResponse,
  ActivityLogResponse,
} from '@/types/activity-log';

export const activityLogKeys = {
  list: (param: string) => [routes.activityLogs.index, param] as const,
  detail: (id: number) => [routes.activityLogs.index, id] as const,
  filterOptions: () => [routes.activityLogs.index, 'filter-options'] as const,
};

export function useActivityLogs(param: string, enabled = true) {
  return useQuery<ActivityLogListResponse, Error>({
    queryKey: activityLogKeys.list(param),
    queryFn: () =>
      client.activityLogs.all(param) as Promise<ActivityLogListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useActivityLog(id: number, enabled = true) {
  return useQuery<ActivityLogResponse, Error>({
    queryKey: activityLogKeys.detail(id),
    queryFn: () =>
      client.activityLogs.findOne(id) as Promise<ActivityLogResponse>,
    enabled: Boolean(id) && enabled,
  });
}

export function useActivityLogFilterOptions(enabled = true) {
  return useQuery<{ data: ActivityLogFilterOptions; message: string }, Error>({
    queryKey: activityLogKeys.filterOptions(),
    queryFn: () =>
      client.activityLogs.filterOptions() as Promise<{
        data: ActivityLogFilterOptions;
        message: string;
      }>,
    enabled,
    staleTime: 5 * 60_000,
  });
}
