import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useFeturesCategories(param:string) {

  return useQuery<any, Error>({queryKey: [routes.features_categories.index,param], queryFn: () => client.features_categories.all(param)});
};

export const useCreateCategory = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  const {mutate, isPending} = useMutation({
    mutationFn: client.features_categories.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.features_categories.index]})
      toast.success('category created successfully')
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
    mutationFn: client.features_categories.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.features_categories.index]})
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
      mutationFn: client.features_categories.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.features_categories.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}