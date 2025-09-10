import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useNotifications(param:string) {

  return useQuery<any, Error>({queryKey: [routes.notifications.index,param], queryFn: () => client.notifications.all(param)});
};

export const useAllNotifications = () => {
  return useQuery<any, Error>({queryKey: [routes.notifications.index, 'allUserNotifications'], queryFn: () => client.notifications.findAllData()});
}

export const useCreateNotifcation = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.notifications.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.notifications.index]})
        toast.success('Notification created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

//   export const useUpdateProduct = () => {
//     const queryClient = useQueryClient();
//     const { closeModal } = useModal();
//   return useMutation({
//       mutationFn: client.products.update,
//       onSuccess: () => {
//         queryClient.invalidateQueries({queryKey: [routes.products.index]})
//         toast.success('Product updated successfully')
//         closeModal()
//       },
//       onError: (error) => {
//         toast.error(`Error ${error?.message}`)
//       }
//     })
//   }


//   export const useDeleteProduct = () => {

//     const queryClient = useQueryClient();
//     return useMutation({
//       mutationFn: client.products.delete,
//       onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.products.index]}),
//       onError: (error) => {
//         toast.error(`Error ${error?.message}`)
//       }
//     })
//   }