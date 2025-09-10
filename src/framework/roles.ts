import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useRoles(param:string) {

  return useQuery<any, Error>({queryKey: [routes.roles.index,param], queryFn: () => client.roles.all(param)});
};

export const usePermissions = () => {

  return useQuery<any, Error>({ queryKey: ['permissions'], queryFn: () => client.roles.permissions()})
}

export const useGetRole = (id: number) => {
  return useQuery({queryKey: [routes.roles.index, {id}], queryFn: () => client.roles.findOne(id)})
}

export const useCreateRoles = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  const {mutate, isPending} = useMutation({
    mutationFn: client.roles.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.roles.index]})
      toast.success('Role created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateRole = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.roles.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.roles.index]})
      toast.success('Role updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteRole = () => {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.roles.delete,
    onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.roles.index]}),
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}