import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useBrand() {

  return useQuery<any, Error>({queryKey: [routes.brands.index], queryFn: () => client.brands.all()});
};
export function useBrands(param:string) {

  return useQuery<any, Error>({queryKey: [routes.brands.index,param], queryFn: () => client.brands.allAgin(param)});
};

export const useCreateBrand = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.brands.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.brands.index]})
      toast.success('Brand created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.brands.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.brands.index]})
      toast.success('Brand updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.brands.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.brands.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}