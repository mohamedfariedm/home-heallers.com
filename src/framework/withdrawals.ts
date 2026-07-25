import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

const listKey = routes.withdrawals.index;

function mutationError(error: Error) {
  toast.error(error?.message || 'Something went wrong');
}

export function useWithdrawalRequests(param: string) {
  return useQuery<any, Error>({
    queryKey: [listKey, param],
    queryFn: () => client.withdrawals.all(param),
  });
}

export const useSettleWithdrawal = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: (id: number | string) => client.withdrawals.approve(id),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [listKey] });
      queryClient.invalidateQueries({ queryKey: [routes.doctorTargets.index] });
      toast.success('Withdrawal settled — external payment confirmed');
      closeModal();
    },
    onError: mutationError,
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.withdrawals.reject,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [listKey] });
      toast.success('Withdrawal rejected');
      closeModal();
    },
    onError: mutationError,
  });
};
