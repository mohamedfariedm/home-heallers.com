import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useStates(param:string) {

  return useQuery<any, Error>({queryKey: [routes.states.index,param], queryFn: () => client.states.all(param)});
};

export const useCreatState = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.states.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.states.index]})
      toast.success('State created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateState = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.states.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.states.index]})
      toast.success('State updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteState = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.states.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.states.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}