import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import { useModal } from '@/app/shared/modal-views/use-modal';
import toast from 'react-hot-toast';
import type {
  OtpActorType,
  OtpCodeMutationResponse,
  OtpCodesListResponse,
  UpdateOtpCodePayload,
} from '@/types/otp-codes';

export const otpCodeKeys = {
  list: (param: string) => [routes.otpCodes.index, param] as const,
};

export function useOtpCodes(param: string, enabled = true) {
  return useQuery<OtpCodesListResponse, Error>({
    queryKey: otpCodeKeys.list(param),
    queryFn: () => client.otpCodes.all(param) as Promise<OtpCodesListResponse>,
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateOtpCode() {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: (input: {
      type: OtpActorType;
      id: number;
    } & UpdateOtpCodePayload) =>
      client.otpCodes.update(input) as Promise<OtpCodeMutationResponse>,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [routes.otpCodes.index] });
      toast.success(response?.message || 'OTP code updated successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to update OTP code');
    },
  });
}

export function useExtendOtpExpiration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { type: OtpActorType; id: number }) =>
      client.otpCodes.extendExpiration(input) as Promise<OtpCodeMutationResponse>,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [routes.otpCodes.index] });
      toast.success(response?.message || 'OTP expiration extended successfully');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to extend OTP expiration');
    },
  });
}

export function toOtpCodeTableRows(
  rows: OtpCodesListResponse['data'] | undefined
) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    entity_id: row.id,
    id: `${row.type}-${row.id}`,
  }));
}
