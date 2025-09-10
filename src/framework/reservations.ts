import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useReservations(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.reservations.index, param],
    queryFn: () => client.reservations.all(param)
  });
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.reservations.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.reservations.index] });
      toast.success('Reservation created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    }
  });
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  return useMutation({
    mutationFn: client.reservations.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.reservations.index] });
      toast.success('Reservation updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    }
  });
}

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: client.reservations.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes.reservations.index] }),
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    }
  });
}