import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

//main Categories
export function useMainCategories(params:string) {
  return useQuery<any, Error>({queryKey: [routes.mainCategories.index,"BG",params], queryFn: () => client.mainCategories.all("BG",params)});
};
//sup Categories
export function useSupCategories(params:string) {
  return useQuery<any, Error>({queryKey: [routes.mainCategories.index,"VCP",params], queryFn: () => client.mainCategories.all("VCP",params)});
};
//sup sup Categories

export function useSupSupCategories(params:string) {
  return useQuery<any, Error>({queryKey: [routes.mainCategories.index,"BU",params], queryFn: () => client.mainCategories.all("BU",params)});
};

export function useAllFilter() {
  return useQuery<any, Error>({queryKey: ['filter_all'], queryFn: () => client.mainCategories.filterAll()})
}


export const useParentMainCategories = (cat:number) => {
    return useQuery<any, Error>({
        queryKey: [routes.mainCategories.index, cat],
        queryFn: () => client.mainCategories.allParent(cat)
        
    })
}

export const useCreateMainCategory = () => {

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

  export const useUpdateMainCategory = () => {
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


  export const useDeleteMainCategory = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.mainCategories.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.mainCategories.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }