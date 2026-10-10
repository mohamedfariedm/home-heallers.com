import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { routes } from '@/config/routes';
import {
  AppMessage,
  AppMessageInput,
  AppMessagesFilters,
  AppMessagesPage,
} from '@/types/app-messages';

const ROOT_KEY = [routes.appMessages.index];

const buildQuery = ({ status, search, page, limit }: AppMessagesFilters) => {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (search.trim()) params.set('search', search.trim());
  params.set('page', String(page));
  params.set('limit', String(limit));
  return params.toString();
};

// Accepts both the paginated shape ({ data, meta }) and a plain { data: [] } list.
export function useAppMessages(filters: AppMessagesFilters) {
  return useQuery<AppMessagesPage, Error>({
    queryKey: [...ROOT_KEY, 'list', filters],
    queryFn: async () => {
      const res: any = await client.appMessages.all(buildQuery(filters));
      const data: AppMessage[] = Array.isArray(res?.data) ? res.data : [];
      const meta = res?.meta;
      return {
        data,
        total: meta?.total ?? data.length,
        currentPage: meta?.current_page ?? 1,
        lastPage: meta?.last_page ?? 1,
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAppMessage(id?: string | number) {
  return useQuery<AppMessage | null, Error>({
    queryKey: [...ROOT_KEY, 'detail', String(id ?? '')],
    queryFn: async () => {
      const res: any = await client.appMessages.findOne(id!);
      return res?.data ?? null;
    },
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export const useCreateAppMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppMessageInput) => client.appMessages.create(data),
    onSuccess: () => {
      toast.success('Message created successfully');
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create message');
    },
  });
};

export const useUpdateAppMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: AppMessageInput }) =>
      client.appMessages.update({ id, data }),
    onSuccess: () => {
      toast.success('Message updated successfully');
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update message');
    },
  });
};

export const useDeleteAppMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => client.appMessages.delete(id),
    onSuccess: () => {
      toast.success('Message deleted successfully');
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete message');
    },
  });
};

export const useToggleAppMessageActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => client.appMessages.toggleActive(id),
    onSuccess: () => {
      toast.success('Message status updated');
      queryClient.invalidateQueries({ queryKey: ROOT_KEY });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update status');
    },
  });
};
