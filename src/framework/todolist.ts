import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils';
import { useModal } from '@/app/shared/modal-views/use-modal';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';

export function useToDoList(param:string) {

  return useQuery<any, Error>({queryKey: [routes.toDoList.index,param], queryFn: () => client.toDoList.all(param)});
};

export const useCreateToDo = () => {

  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const {mutate, isPending} = useMutation({
    mutationFn: client.toDoList.create,
    onSuccess() {
      queryClient.invalidateQueries({queryKey: [routes.toDoList.index]})
      toast.success('point created successfully')
      closeModal()
    },
    onError: (error:any) => {
      toast.error(`Error ${error?.response?.data.message}`)   
     }
  })

  return { mutate, isPending}
}

export const useUpdateToDoList = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.toDoList.update,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: [routes.toDoList.index]})
      toast.success('Point updated successfully')
      closeModal()
    },
    onError: (error:any) => {
      toast.error(`Error ${error?.response?.data.message}`)   
     }
  })
}

export const useDeleteToDoList = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.toDoList.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.toDoList.index]}),
      onError: (error:any) => {
        toast.error(`Error ${error?.response?.data.message}`)   
       }
    })
}