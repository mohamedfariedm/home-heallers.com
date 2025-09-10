import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCategories(param:string) {

  return useQuery<any, Error>({queryKey: [routes.mainCategories.index,param], queryFn: () => client.mainCategories.all(param)});
};




export const useCreateCategory = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  const {mutate, isPending} = useMutation({
    mutationFn: client.mainCategories.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.mainCategories.index]})
      toast.success('Category created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateCategory = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.mainCategories.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.mainCategories.index]})
      toast.success('Category updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteCategory = () => {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.mainCategories.delete,
    onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.mainCategories.index]}),
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}