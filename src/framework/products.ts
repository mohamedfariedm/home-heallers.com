import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useProducts(param:string) {

  return useQuery<any, Error>({queryKey: [routes.products.index,param], queryFn: () => client.products.all(param)});
};

export const useAllProductData = () => {
  return useQuery<any, Error>({queryKey: [routes.products.index, 'all'], queryFn: () => client.products.findAllData()});
}
export const useSpacificBU = (id:number) => {
  return useQuery<any, Error>({queryKey: ["SpacifcProduct",id], queryFn: () => client.products.findSpacifcData(id)});
}

export const useCreateProduct = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.products.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.products.index]})
        toast.success('Product created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.products.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.products.index]})
        toast.success('Product updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeleteProduct = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.products.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.products.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }