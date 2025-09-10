import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useFetures(param:string) {

  return useQuery<any, Error>({queryKey: [routes.features.index,param], queryFn: () => client.features.all(param)});
};
export function useCategories() {

  return useQuery<any, Error>({queryKey: [routes.features.index, 'all'], queryFn: () => client.features.getCategories()});
};

export const useCreateFeature = () => {
  const { closeModal } = useModal();


  const queryClient = useQueryClient();
  const {mutate, isPending} = useMutation({
    mutationFn: client.features.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.features.index]})
      toast.success('Feature created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateFeature = () => {
  const { closeModal } = useModal();


  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.features.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.features.index]})
      toast.success('Feature updated successfully')
      closeModal()

    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteFeatures = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.features.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.features.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}