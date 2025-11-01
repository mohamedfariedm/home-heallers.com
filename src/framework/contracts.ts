import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useContracts(param:string) {
  return useQuery<any, Error>({queryKey: [routes.contracts.index,param], queryFn: () => client.contracts.all(param)});
};

export const useContractById = (id:number) => {
  return useQuery<any, Error>({queryKey: ["contract",id], queryFn: () => client.contracts.findOne(id)});
}

export const useCreateContract = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.contracts.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.contracts.index]})
        toast.success('Contract created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateContract = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.contracts.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.contracts.index]})
        toast.success('Contract updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }

  export const useDeleteContract = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.contracts.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.contracts.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }

