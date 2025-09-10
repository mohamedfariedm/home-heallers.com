import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useNationality(param:string) {

  return useQuery<any, Error>({queryKey: [routes.nationalities.index,param], queryFn: () => client.nationalities.all(param)});
};


export const useCreateNationality = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  const {mutate, isPending} = useMutation({
    mutationFn: client.nationalities.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.nationalities.index]})
      toast.success('Nationalities created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateNationality = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.nationalities.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.nationalities.index]})
      toast.success('Nationalities updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteNationality = () => {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.nationalities.delete,
    onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.nationalities.index]}),
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}