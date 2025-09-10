import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCities(param:string) {

  return useQuery<any, Error>({queryKey: [routes.cities.index,param], queryFn: () => client.cities.all(param)});
};

export const useCreateCity = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.cities.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.cities.index]})
      toast.success('Region created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateCity = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.cities.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.cities.index]})
      toast.success('City updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteCity = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.cities.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.cities.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}