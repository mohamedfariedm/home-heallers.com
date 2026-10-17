import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import { unwrapAdminRecord } from '@/utils/slugs';
import { isFieldValidationError } from '@/utils/seo-fields';

export function useCategories(param:string) {

  return useQuery<any, Error>({queryKey: [routes.mainCategories.index,param], queryFn: () => client.mainCategories.all(param)});
};

export function useCategoryDetail(id?: string | number) {
  return useQuery<any, Error>({
    queryKey: [routes.mainCategories.index, 'detail', id],
    queryFn: async () => unwrapAdminRecord(await client.mainCategories.findOne(id!)),
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export const useCreateCategory = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  const {mutate, mutateAsync, isPending} = useMutation({
    mutationFn: client.mainCategories.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.mainCategories.index]})
      toast.success('Category created successfully')
      closeModal()
    },
    onError: (error) => {
      if (isFieldValidationError(error)) return;
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, mutateAsync, isPending}
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
      if (isFieldValidationError(error)) return;
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
