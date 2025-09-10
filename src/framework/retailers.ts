import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useRetailers(param:string) {

  return useQuery<any, Error>({queryKey: [routes.retailers.index,param], queryFn: () => client.retailers.all(param)});
};

export const useCreateRetailer = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.retailers.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.retailers.index]})
      toast.success('Retailer created successfully')
      closeModal()
    },
    onError: (error) => {
      console.log(error);
      
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateRetailer = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.retailers.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.retailers.index]})
      toast.success('Retailer updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteRetailer = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.retailers.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.retailers.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}