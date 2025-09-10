import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export const useInquery = (param:string) => {
    return useQuery<any, Error>({queryKey: [routes.inquiries.index,param], queryFn: () => client.inquerie.all(param)});
}


export const useUpdateInquerie = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.inquerie.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.inquiries.index]})
        toast.success('Inquiries updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
}

export function useIeaModal(id:number) {
  return useQuery<any, Error>({queryKey: [routes.inquiries.index,"pormotion" ,id], queryFn: () => client.inquerie.findOne(id)});
};