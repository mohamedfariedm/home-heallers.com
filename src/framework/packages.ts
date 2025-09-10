import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function usePackages(param:string) {

  return useQuery<any, Error>({queryKey: [routes.packages.index,param], queryFn: () => client.packages.all(param)});
};

export const useCreatePackages = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.packages.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.packages.index]})
        toast.success('packages created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdatePackages = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.packages.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.packages.index]})
        toast.success('packages updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeletePackages = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.packages.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.packages.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }