import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useDoctors(param:string) {
  return useQuery<any, Error>({queryKey: [routes.doctors.index, param], queryFn: () => client.doctors.all(param)});
};

export const useCreateDoctors = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.doctors.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.doctors.index]})
      toast.success('Doctor created successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })

  return { mutate, isPending}
}

export const useUpdateDoctors = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.doctors.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.doctors.index]})
      toast.success('Doctor updated successfully')
      closeModal()
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}

export const useDeleteDoctors = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.doctors.delete,
    onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.doctors.index]}),
    onError: (error) => {
      toast.error(`Error ${error?.message}`)
    }
  })
}