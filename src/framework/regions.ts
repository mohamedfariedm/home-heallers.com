import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useRegions(param:string) {

  return useQuery<any, Error>({queryKey: [routes.regions.index,param], queryFn: () => client.regions.all(param)});
};

export const useCreateRegion = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.regions.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.regions.index]})
        toast.success('Region created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateRegion = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.regions.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.regions.index]})
        toast.success('Region updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeleteRegion = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.regions.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.regions.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }