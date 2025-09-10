import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';
import client from '@/framework/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useFaqs() {
  return useQuery<any, Error>({
    queryKey: [routes.faqs.index],
    queryFn: () => client.faqs.all(),
  });
}

export const useCreateFaqs = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  const { mutate, isPending } = useMutation({
    mutationFn: client.faqs.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.faqs.index] });
      toast.success('Faq created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });

  return { mutate, isPending };
};

export const useUpdateFaqs = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();
  return useMutation({
    mutationFn: client.faqs.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.faqs.index] });
      toast.success('Faq updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};

export const useDeleteFaqs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.faqs.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [routes.faqs.index] }),
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};
