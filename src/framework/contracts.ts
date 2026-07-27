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
  
    const { mutate, mutateAsync, isPending } = useMutation({
      mutationFn: client.contracts.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.contracts.index]})
        toast.success('Contract created successfully')
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, mutateAsync, isPending }
  }

  export const useUpdateContract = () => {
    const queryClient = useQueryClient();
  return useMutation({
      mutationFn: client.contracts.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.contracts.index]})
        toast.success('Contract updated successfully')
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

  export const useAddContractCommunication = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();

    return useMutation({
      mutationFn: client.contracts.addCommunication,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [routes.contracts.index] });
        toast.success('Communication date added successfully');
        closeModal();
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`);
      },
    });
  };

  export const useUpdateContractNotes = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();

    return useMutation({
      mutationFn: client.contracts.updateNotes,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [routes.contracts.index] });
        toast.success('Contract notes updated successfully');
        closeModal();
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`);
      },
    });
  };

  export const useUploadContractAttachments = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
      mutationFn: client.contracts.uploadAttachments,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [routes.contracts.index] });
        toast.success('Attachment(s) uploaded successfully');
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`);
      },
    });

    return {
      mutate: mutation.mutate,
      mutateAsync: mutation.mutateAsync,
      isPending: mutation.isPending,
    };
  };

  export const useDeleteContractAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: client.contracts.deleteAttachment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [routes.contracts.index] });
        toast.success('Attachment deleted successfully');
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`);
      },
    });
  };

