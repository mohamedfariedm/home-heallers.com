import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';

export function useReservationReviews(params?: string) {
  return useQuery<any, Error>({
    queryKey: [routes.reservationReviews.index, params],
    queryFn: () => client.reservationReviews.all(params || ''),
  });
}

export function useReservationReview(id: number) {
  return useQuery<any, Error>({
    queryKey: [routes.reservationReviews.index, id],
    queryFn: () => client.reservationReviews.findOne(id),
    enabled: !!id,
  });
}

export const useToggleReservationReview = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: (id: number) => client.reservationReviews.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.reservationReviews.index] });
      toast.success('Review status toggled successfully');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error?.message || 'Failed to toggle review status'}`);
    },
  });

  return { mutate, mutateAsync, isPending };
};

export const useToggleReviewShowOnPackage = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: (id: number) => client.reservationReviews.toggleShowOnPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.reservationReviews.index] });
      toast.success('Offer visibility updated');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 403) {
        toast.error("You don't have permission to change review visibility");
        return;
      }
      toast.error(error?.message || 'Failed to update offer visibility');
    },
  });

  return { mutate, mutateAsync, isPending };
};
