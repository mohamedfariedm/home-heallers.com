import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import {
  formatKpiExportSuccessMessage,
  triggerKpiExportDownload,
} from '@/utils/kpi-export';
import type {
  DoctorActivityDetailResponse,
  DoctorActivityExportResponse,
  DoctorActivityFilterOptions,
  DoctorActivityListResponse,
} from '@/types/doctor-activity-report';

export const doctorActivityReportKeys = {
  list: (param: string) => [routes.doctorActivityReports.index, param] as const,
  detail: (doctorId: number, param: string) =>
    [routes.doctorActivityReports.index, doctorId, param] as const,
  filterOptions: () =>
    [routes.doctorActivityReports.index, 'filter-options'] as const,
};

export function useDoctorActivityReports(param: string, enabled = true) {
  return useQuery<DoctorActivityListResponse, Error>({
    queryKey: doctorActivityReportKeys.list(param),
    queryFn: () =>
      client.doctorActivityReports.all(
        param
      ) as Promise<DoctorActivityListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useDoctorActivityReportDetail(
  doctorId: number,
  param: string,
  enabled = true
) {
  return useQuery<DoctorActivityDetailResponse, Error>({
    queryKey: doctorActivityReportKeys.detail(doctorId, param),
    queryFn: () =>
      client.doctorActivityReports.findOne(
        doctorId,
        param
      ) as Promise<DoctorActivityDetailResponse>,
    enabled: Boolean(doctorId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useDoctorActivityReportFilterOptions(enabled = true) {
  return useQuery<{ data: DoctorActivityFilterOptions; message: string }, Error>({
    queryKey: doctorActivityReportKeys.filterOptions(),
    queryFn: () =>
      client.doctorActivityReports.filterOptions() as Promise<{
        data: DoctorActivityFilterOptions;
        message: string;
      }>,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useDoctorActivityReportExport() {
  return useMutation({
    mutationFn: (param: string) =>
      client.doctorActivityReports.export(
        param
      ) as Promise<DoctorActivityExportResponse>,
    onSuccess: (data) => {
      toast.success(formatKpiExportSuccessMessage(data));
      triggerKpiExportDownload(data);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Export failed');
    },
  });
}
