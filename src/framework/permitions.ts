import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function usePermissions(param:string) {

  return useQuery<any, Error>({queryKey: [routes.permissions.index,param], queryFn: () => client.permissions.all(param)});
};

export const usePermissionsCreate = () => {

  return useQuery<any, Error>({ queryKey: ['permissions'], queryFn: () => client.permissions.permissions()})
}

export const useGetRole = (id: number) => {
  return useQuery({queryKey: [routes.permissions.index, {id}], queryFn: () => client.permissions.findOne(id)})
}

export const useCreatePermissions = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  const {mutate, isPending} = useMutation({
    mutationFn: client.permissions.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.permissions.index]})
      toast.success('Permition created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdatePermition = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.permissions.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.permissions.index]})
      toast.success('Permition updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeletePermition = () => {

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.permissions.delete,
    onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.permissions.index]}),
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}