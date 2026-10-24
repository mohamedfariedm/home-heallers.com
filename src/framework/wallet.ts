import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';

export type WalletOwner = 'doctors' | 'clients';

export type WalletTransactionFilters = {
  page?: number;
  per_page?: number;
  type?: string;
  status?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
};

const walletKey = (owner: WalletOwner, id: number | string) => ['wallet', owner, String(id)];

function mutationError(error: Error) {
  toast.error(error?.message || 'Something went wrong');
}

export function useWalletSummary(owner: WalletOwner, id: number | string, enabled = true) {
  return useQuery<any, Error>({
    queryKey: [...walletKey(owner, id), 'summary'],
    queryFn: () => client.wallet.summary(owner, id),
    enabled: enabled && !!id,
  });
}

export function useWalletTransactions(
  owner: WalletOwner,
  id: number | string,
  filters: WalletTransactionFilters,
  enabled = true
) {
  // Drop empty values so they are not sent as empty query params.
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v != null)
  );
  return useQuery<any, Error>({
    queryKey: [...walletKey(owner, id), 'transactions', params],
    queryFn: () => client.wallet.transactions(owner, id, params),
    enabled: enabled && !!id,
    placeholderData: keepPreviousData,
  });
}

export const useWalletAdjust = (owner: WalletOwner, id: number | string) => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.wallet.adjust,
    onSuccess(res: any, variables) {
      queryClient.invalidateQueries({ queryKey: walletKey(owner, id) });
      toast.success(
        res?.message ||
          (variables.kind === 'deposit' ? 'Deposit completed' : 'Withdrawal completed')
      );
      closeModal();
    },
    onError: mutationError,
  });
};
