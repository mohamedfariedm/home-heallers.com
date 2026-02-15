import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useInvoices(param: string) {
  return useQuery<any, Error>({ queryKey: [routes.invoices.index, param], queryFn: () => client.invoices.all(param) });
}

export const useCreateInvoices = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.invoices.create,
    onSuccess: () => {
      toast.success('Invoice created successfully');
      queryClient.invalidateQueries({ queryKey: [routes.invoices.index] });
      closeModal();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useUpdateInvoices = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.invoices.update,
    onSuccess: () => {
      toast.success('Invoices updated successfully');
      queryClient.invalidateQueries({ queryKey: [routes.invoices.index] });
      closeModal();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useDeleteInvoices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.invoices.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes.invoices.index] }),
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};

export const useDeleteInvoiceDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.invoiceDetails.delete,
    onSuccess: () => {
      toast.success('Invoice detail deleted successfully');
      queryClient.invalidateQueries({ queryKey: [routes.invoices.index] });
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });
};
