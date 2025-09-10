import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCountries(param:string) {

  return useQuery<any, Error>({queryKey: [routes.countries.index,param], queryFn: () => client.countries.all(param)});
};

export const useCreatecountries = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.countries.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.countries.index]})
        toast.success('countries created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdatecountries = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.countries.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.countries.index]})
        toast.success('countries updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeletecountries = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.countries.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.countries.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }