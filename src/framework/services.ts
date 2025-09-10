import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useServices(param:string) {

  return useQuery<any, Error>({queryKey: [routes.services.index,param], queryFn: () => client.services.all(param)});
};

export const useCreateServices = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.services.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.services.index]})
      toast.success('Services created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateServices = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.services.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.services.index]})
      toast.success('Services updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteServices = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.services.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.services.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}