import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useClientReview() {

  return useQuery<any, Error>({queryKey: [routes.ClientReview.index], queryFn: () => client.clientReview.all()});
};


export const useCreateClientReview = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.clientReview.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.ClientReview.index]})
      toast.success('Review created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateClientReview = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.clientReview.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.ClientReview.index]})
      toast.success('Review updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteClientReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.clientReview.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.ClientReview.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}