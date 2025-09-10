import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useTargets(param:string) {

  return useQuery<any, Error>({queryKey: [routes.targets.index,param], queryFn: () => client.targets.all(param)});
};

export const useAllTargets = () => {
  return useQuery<any, Error>({queryKey: [routes.targets.index, 'allTargets'], queryFn: () => client.targets.findAll()})
}

export const useCreateTarget = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.targets.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.targets.index]})
        toast.success('Target created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateTarget = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.targets.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.targets.index]})
        toast.success('Target updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeleteTarget = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.targets.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.targets.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }