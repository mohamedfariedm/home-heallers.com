import { useQuery, useMutation, useQueryClient  } from '@tanstack/react-query';
import client from '@/framework/utils'
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useCustomerSupport(param:string) {

  return useQuery<any, Error>({queryKey: [routes.customerSupport.index,param], queryFn: () => client.customerSupport.all(param)});
};

export const useCreateCustomerSupport = () => {

    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  
    const {mutate, isPending} = useMutation({
      mutationFn: client.customerSupport.create,
      onSuccess() {
        queryClient.invalidateQueries({queryKey: [routes.customerSupport.index]})
        toast.success('customerSupport created successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  
    return { mutate, isPending}
  }

  export const useUpdateCustomerSupport = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
  return useMutation({
      mutationFn: client.customerSupport.update,
      onSuccess: () => {
        queryClient.invalidateQueries({queryKey: [routes.customerSupport.index]})
        toast.success('customerSupport updated successfully')
        closeModal()
      },
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }


  export const useDeleteCustomerSupport = () => {

    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: client.customerSupport.delete,
      onSuccess: () => queryClient.invalidateQueries({queryKey: [routes.customerSupport.index]}),
      onError: (error) => {
        toast.error(`Error ${error?.message}`)
      }
    })
  }

  export const useDownloadCustomerSupportSampleSheet = () => {
    return useMutation({
      mutationFn: async () => {
        const data = await client.customerSupport.downloadSampleSheet();
        // Download the file
        if (data.download_url) {
          const link = document.createElement('a');
          link.href = data.download_url;
          link.download = data.file_name || 'customer_support_sample_sheet.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return data;
      },
      onSuccess: () => {
        toast.success('Sample sheet downloaded successfully');
      },
      onError: (error) => {
        toast.error(`Error downloading sample sheet: ${error?.message}`);
      }
    });
  }

  export const useImportCustomerSupport = () => {
    const queryClient = useQueryClient();
    const { closeModal } = useModal();

    return useMutation({
      mutationFn: async (file: FormData) => {
        const response = await client.customerSupport.import(file);
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [routes.customerSupport.index] });
        const message = data.status === 'success' 
          ? `Successfully imported ${data.successful_imports} customer support(s)`
          : `Import completed: ${data.successful_imports} successful, ${data.failed_imports} failed`;
        toast.success(message);
        closeModal();
      },
      onError: (error) => {
        toast.error(`Error importing customer support: ${error?.message}`);
      }
    });
  }