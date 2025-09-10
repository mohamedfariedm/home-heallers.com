import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useStores(param:string) {

  return useQuery<any, Error>({queryKey: [routes.stores.index,param], queryFn: () => client.stores.all(param)});
};

export const useCreateStore = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.stores.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.stores.index]})
      toast.success('store created successfully')
      closeModal()
    },
    onError: (error:any) => {
      toast.error(`Error ${error?.response?.data.message}`)   
     }
  })

  return { mutate, isPending}
}

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.stores.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.stores.index]})
      toast.success('Store updated successfully')
      closeModal()
    },
    onError: (error:any) => {
      toast.error(`Error ${error?.response?.data.message}`)   
     }
  })
}

export const useDeleteStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.stores.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.stores.index]}),
      onError: (error:any) => {
        toast.error(`Error ${error?.response?.data.message}`)   
       }
    })
}