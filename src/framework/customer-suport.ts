import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCustomerSupport(param:string) {

  return useQuery<any, Error>({queryKey: [routes.customerSupport.index,param], queryFn: () => client.customerSupport.all(param)});
};

export const useCreateCustomerSupport = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.customerSupport.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.customerSupport.index]})
        toast.success('customerSupport created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateCustomerSupport = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.customerSupport.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.customerSupport.index]})
        toast.success('customerSupport updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeleteCustomerSupport = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.customerSupport.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.customerSupport.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }