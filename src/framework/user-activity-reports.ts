import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import {
  formatKpiExportSuccessMessage,
  triggerKpiExportDownload,
} from '@/utils/kpi-export';
import type {
  UserActivityDetailResponse,
  UserActivityExportResponse,
  UserActivityFilterOptions,
  UserActivityListResponse,
} from '@/types/user-activity-report';

export const userActivityReportKeys = {
  list: (param: string) => [routes.userActivityReports.index, param] as const,
  detail: (userId: number, param: string) =>
    [routes.userActivityReports.index, userId, param] as const,
  filterOptions: () =>
    [routes.userActivityReports.index, 'filter-options'] as const,
};

export function useUserActivityReports(param: string, enabled = true) {
  return useQuery<UserActivityListResponse, Error>({
    queryKey: userActivityReportKeys.list(param),
    queryFn: () =>
      client.userActivityReports.all(
        param
      ) as Promise<UserActivityListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useUserActivityReportDetail(
  userId: number,
  param: string,
  enabled = true
) {
  return useQuery<UserActivityDetailResponse, Error>({
    queryKey: userActivityReportKeys.detail(userId, param),
    queryFn: () =>
      client.userActivityReports.findOne(
        userId,
        param
      ) as Promise<UserActivityDetailResponse>,
    enabled: Boolean(userId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useUserActivityReportFilterOptions(enabled = true) {
  return useQuery<{ data: UserActivityFilterOptions; message: string }, Error>({
    queryKey: userActivityReportKeys.filterOptions(),
    queryFn: () =>
      client.userActivityReports.filterOptions() as Promise<{
        data: UserActivityFilterOptions;
        message: string;
      }>,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useUserActivityReportExport() {
  return useMutation({
    mutationFn: (param: string) =>
      client.userActivityReports.export(
        param
      ) as Promise<UserActivityExportResponse>,
    onSuccess: (data) => {
      toast.success(formatKpiExportSuccessMessage(data));
      triggerKpiExportDownload(data);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Export failed');
    },
  });
}
