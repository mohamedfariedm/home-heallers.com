// import { API_ENDPOINTS } from '@framework/utils/endpoints';
import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useUsers(param:string) {

  return useQuery<any, Error>({queryKey: [routes.users.index,param], queryFn: () => client.users.all(param)});
};
export function useFindUsers(id:string) {

  return useQuery<any, Error>({queryKey: [routes.users.index,id], queryFn: () => client.users.findeOne(id)});
};

// export const usePermissions = () => {

//   return useQuery<any, Error>({ queryKey: ['permissions'], queryFn: () => client.roles.permissions()})
// }

// export const useGetRole = (id: number) => {
//   return useQuery({queryKey: ['role', {id}], queryFn: () => client.roles.findOne(id)})
// }

export const useCreateUser = () => {

  const queryClient = useQueryClient();

  const { closeModal } = useModal();
  const {mutate, isPending} = useMutation({
    mutationFn: client.users.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.users.index]})
      toast.success('user created successfully')
      closeModal()
    },
    onError: (error:any) => {
      toast.error(`Error ${error?.response?.data.message.phone||error?.response?.data.message.email}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateUser = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.users.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.users.index]})
      toast.success('User updated successfully')
      closeModal()
    },
    onError: (error:any) => {
                  toast.error(`Error ${error?.response?.data.message.phone||error?.response?.data.message.email}`)   
                 }
  })
}

export const useDeleteUser = () => {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.users.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.users.index]})
      toast.success('User Deleted successfully')
    },    onError: (error:any) => {
                  toast.error(`Error ${error?.response?.data.message}`) 
                   }
  })
}