import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCoupons(param:string) {

  return useQuery<any, Error>({queryKey: [routes.coupons.index,param], queryFn: () => client.coupons.all(param)});
};

export const useCreateCoupons = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.coupons.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.coupons.index]})
        toast.success('Coupons created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateCoupons = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
    const {mutate, isPending} = useMutation({
      mutationFn: client.coupons.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.coupons.index]})
        toast.success('Coupons updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }


  export const useDeleteCoupons = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.coupons.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.coupons.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }