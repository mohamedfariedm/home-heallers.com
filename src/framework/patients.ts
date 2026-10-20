import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function usePatients(param:string) {

  return useQuery<any, Error>({queryKey: [routes.patients.index,param], queryFn: () => client.patients.all(param)});
};

export function usePatient(id: string | number, enabled = true) {
  return useQuery<any, Error>({
    queryKey: [routes.patients.index, id],
    queryFn: () => client.patients.findOne(Number(id)),
    enabled: Boolean(id) && enabled,
  });
}

export const useCreatePatients = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.patients.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.patients.index]})
        toast.success('patients created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdatePatients = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.patients.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.patients.index]})
        toast.success('patients updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }

  export type ClientFieldPatch = {
    id: number | string;
    nationality_id?: number;
    national_id?: string;
  };

  export const useUpdateClientFields = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (input: ClientFieldPatch) => client.patients.updateFields(input),
      onSuccess: (_res, variables) => {
        queryClient.invalidateQueries({ queryKey: [routes.patients.index] });
        queryClient.invalidateQueries({
          queryKey: [routes.patients.index, variables.id],
        });
      },
      onError: (error) => {
        toast.error(error?.message || 'تعذر حفظ بيانات العميل');
      },
    });
  };


  export const useDeletePatients = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.patients.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.patients.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }