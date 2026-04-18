import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';

export function useGroups(param: string) {
  return useQuery<any, Error>({
    queryKey: [routes.groups.index, param],
    queryFn: () => client.groups.all(param),
  });
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.groups.create,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.groups.index] });
      toast.success('Group created successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to create group');
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: client.groups.update,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [routes.groups.index] });
      toast.success('Group updated successfully');
      closeModal();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to update group');
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => client.groups.delete({ group_id: id })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.groups.index] });
      toast.success('Group deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to delete group');
    },
  });
};