import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useStocks(params:string) {

  return useQuery<any, Error>({queryKey: [routes.stock.index,params], queryFn: () => client.stock.all(params)});
};

export const useCreateAllStock = () => {
    return useQuery<any, Error>({queryKey: [routes.stock.index, 'all'], queryFn: () => client.stock.findAll()})
}

export const useCreateStock = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.stock.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.stock.index]})
        toast.success('Stock created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateStock = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.stock.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.stock.index]})
        toast.success('Stock updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }

