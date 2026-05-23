import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import type {
  ZatcaInvoice,
  ZatcaPaginatedResponse,
  ZatcaQrResponse,
  ZatcaXmlResponse,
  ZatcaRevalidateResponse,
  XmlKind,
  ZatcaMode,
} from '@/types/zatca';

export const zatcaKeys = {
  list: (param: string) => ['zatca-invoices', param] as const,
  detail: (id: number | string) => ['zatca-invoice', id] as const,
  submissions: (id: number | string) => ['zatca-submissions', id] as const,
  xml: (id: number | string, kind: XmlKind) => ['zatca-xml', id, kind] as const,
  qr: (id: number | string) => ['zatca-qr', id] as const,
};

export function useZatcaInvoices(param: string, enabled = true) {
  return useQuery<ZatcaPaginatedResponse<ZatcaInvoice>, Error>({
    queryKey: zatcaKeys.list(param),
    queryFn: () => client.zatca.list(param) as Promise<ZatcaPaginatedResponse<ZatcaInvoice>>,
    enabled,
  });
}

export function useZatcaInvoice(id: number | string, enabled = true) {
  return useQuery<{ data: ZatcaInvoice }, Error>({
    queryKey: zatcaKeys.detail(id),
    queryFn: () => client.zatca.get(id) as Promise<{ data: ZatcaInvoice }>,
    enabled: Boolean(id) && enabled,
  });
}

export function useZatcaSubmissions(id: number | string, enabled = true) {
  return useQuery<ZatcaPaginatedResponse<unknown>, Error>({
    queryKey: zatcaKeys.submissions(id),
    queryFn: () => client.zatca.submissions(id) as Promise<ZatcaPaginatedResponse<unknown>>,
    enabled: Boolean(id) && enabled,
  });
}

export function useZatcaXml(id: number | string, kind: XmlKind, enabled = false) {
  return useQuery<ZatcaXmlResponse, Error>({
    queryKey: zatcaKeys.xml(id, kind),
    queryFn: () => client.zatca.xml(id, kind) as Promise<ZatcaXmlResponse>,
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

export function useZatcaQr(id: number | string, enabled = false) {
  return useQuery<ZatcaQrResponse, Error>({
    queryKey: zatcaKeys.qr(id),
    queryFn: () => client.zatca.qr(id) as Promise<ZatcaQrResponse>,
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}

function invalidateInvoice(queryClient: ReturnType<typeof useQueryClient>, id?: number | string) {
  queryClient.invalidateQueries({ queryKey: ['zatca-invoices'] });
  if (id) queryClient.invalidateQueries({ queryKey: zatcaKeys.detail(id) });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, mode }: { id: number | string; mode?: ZatcaMode }) => {
      const res = await client.zatca.issue(id, { mode: mode ?? 'reporting' });
      return res;
    },
    onSuccess: (res, { id }) => {
      toast.success(res.data?.message ?? 'Invoice submission queued');
      invalidateInvoice(queryClient, id);
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => client.zatca.cancel(id),
    onSuccess: (res, id) => {
      toast.success(res.data?.message ?? 'Invoice cancelled');
      invalidateInvoice(queryClient, id);
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useZatcaSubmit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mode,
      force,
    }: {
      id: number | string;
      mode?: ZatcaMode;
      force?: boolean;
    }) => client.zatca.submit(id, { mode: mode ?? 'reporting', force: force ?? false }),
    onSuccess: (res, { id }) => {
      toast.success(res.data?.message ?? 'Submission queued');
      invalidateInvoice(queryClient, id);
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useZatcaRetry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mode,
      force,
    }: {
      id: number | string;
      mode?: ZatcaMode;
      force?: boolean;
    }) => client.zatca.retry(id, { mode: mode ?? 'reporting', force: force ?? false }),
    onSuccess: (res, { id }) => {
      toast.success(res.data?.message ?? 'Retry submission queued');
      invalidateInvoice(queryClient, id);
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useZatcaRevalidate() {
  return useMutation({
    mutationFn: (id: number | string) => client.zatca.revalidate(id),
    onError: (err: any) => toast.error(err.message),
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      adjustment_reason,
      mode,
    }: {
      id: number | string;
      amount: number;
      adjustment_reason: string;
      mode?: ZatcaMode;
    }) =>
      client.zatca.creditNote(id, {
        amount,
        adjustment_reason,
        mode: mode ?? 'reporting',
      }),
    onError: (err: any) => toast.error(err.message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zatca-invoices'] }),
  });
}

export function useCreateDebitNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      adjustment_reason,
      mode,
    }: {
      id: number | string;
      amount: number;
      adjustment_reason: string;
      mode?: ZatcaMode;
    }) =>
      client.zatca.debitNote(id, {
        amount,
        adjustment_reason,
        mode: mode ?? 'reporting',
      }),
    onError: (err: any) => toast.error(err.message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zatca-invoices'] }),
  });
}

export function useZatcaExport() {
  return useMutation({
    mutationFn: (param: string) =>
      client.zatca.export(param) as Promise<{
        message: string;
        download_url: string;
        count: number;
      }>,
    onSuccess: (data) => {
      toast.success(data.message ?? 'Export ready');
      if (data.download_url) window.open(data.download_url, '_blank');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export type { ZatcaRevalidateResponse };
