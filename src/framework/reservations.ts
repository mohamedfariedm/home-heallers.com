import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useReservations(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.reservations.index, param],
    queryFn: () => client.reservations.all(param)
  });
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.reservations.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.reservations.index] });
      toast.success('Reservation created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    }
  });
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  
  return useMutation({
    mutationFn: client.reservations.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.reservations.index] });
      toast.success('Reservation updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    }
  });
}

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: client.reservations.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes.reservations.index] }),
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    }
  });
}

export const useDownloadReservationsSampleSheet = () => {
  return useMutation({
    mutationFn: async () => {
      const data = await client.reservations.downloadSampleSheet();
      // Download the file
      if (data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = data.file_name || 'reservations_sample_sheet.xlsx';
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

export const useImportReservations = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: async (file: FormData) => {
      const response = await client.reservations.import(file);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [routes.reservations.index] });
      const message = data.status === 'success' 
        ? `Successfully imported ${data.successful_imports} reservation(s)`
        : `Import completed: ${data.successful_imports} successful, ${data.failed_imports} failed`;
      toast.success(message);
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error importing reservations: ${error?.message}`);
    }
  });
}