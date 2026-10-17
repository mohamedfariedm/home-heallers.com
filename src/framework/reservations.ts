import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import type {
  ReservationCalendarResponse,
  ReservationsCalendarParams,
  SessionStatus,
} from '@/types/reservation-calendar';

export function useReservations(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.reservations.index, param],
    queryFn: () => client.reservations.all(param)
  });
}

export function useReservationsCalendar(params: ReservationsCalendarParams) {
  const queryParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null
    )
  ) as Record<string, string | number>;

  return useQuery<ReservationCalendarResponse, Error>({
    queryKey: [routes.reservations.index, 'calendar', queryParams],
    queryFn: () => client.reservations.calendar(queryParams),
  });
}

/** Load a full month via `month=YYYY-MM` (preferred over day-by-day fetches). */
export function useReservationsCalendarMonth(params: {
  year: number;
  month: number; // 1-12
  status?: SessionStatus | '';
  doctor_id?: number | string;
}) {
  const { year, month, status, doctor_id } = params;
  const monthParam = `${year}-${String(month).padStart(2, '0')}`;

  return useQuery<ReservationCalendarResponse, Error>({
    queryKey: [
      routes.reservations.index,
      'calendar-month',
      monthParam,
      status || '',
      doctor_id || '',
    ],
    queryFn: async () => {
      const queryParams: ReservationsCalendarParams = {
        month: monthParam,
        ...(status ? { status } : {}),
        ...(doctor_id ? { doctor_id } : {}),
      };

      const response = (await client.reservations.calendar(
        Object.fromEntries(
          Object.entries(queryParams).filter(
            ([, value]) => value !== undefined && value !== '' && value !== null
          )
        ) as Record<string, string | number>
      )) as ReservationCalendarResponse;

      return {
        data: Array.isArray(response?.data) ? response.data : [],
        statistics: response?.statistics ?? {
          total: 0,
          by_status: [
            { status: 'pending', count: 0 },
            { status: 'confirmed', count: 0 },
            { status: 'completed', count: 0 },
            { status: 'cancelled', count: 0 },
            { status: 'failed', count: 0 },
          ],
        },
        message: response?.message ?? '',
        meta: response?.meta,
      };
    },
    staleTime: 60_000,
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

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      reservation_id: number;
      status: number;
      paid?: boolean;
      notes?: string;
    }) => {
      const response = await client.reservations.updateStatus(input);
      return response?.data?.[0] ?? response?.data ?? response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.reservations.index] });
      toast.success('Reservation updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update reservation status'
      );
    },
  });
};

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