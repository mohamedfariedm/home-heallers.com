import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useAddresses(param: string) {
  return useQuery<any, Error>({ queryKey: [routes.addresses.index, param], queryFn: () => client.addresses.all(param) });
}

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.addresses.create,
    onSuccess: () => {
      toast.success('Address created successfully');
      queryClient.invalidateQueries({ queryKey: [routes.addresses.index] });
      closeModal();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.addresses.update,
    onSuccess: () => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries({ queryKey: [routes.addresses.index] });
      closeModal();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.addresses.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes.addresses.index] }),
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};
