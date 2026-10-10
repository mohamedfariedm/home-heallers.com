import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { routes } from '@/config/routes';

export function useHighlights(queryString: string) {
  return useQuery<any, Error>({
    queryKey: [routes.highlights.index, queryString],
    queryFn: () => client.highlights.all(queryString),
  });
}

export function useHighlightDetail(id?: string | number) {
  return useQuery<any, Error>({
    queryKey: [routes.highlights.index, 'detail', id],
    queryFn: async () => {
      const res: any = await client.highlights.findOne(id!);
      // Envelope returns array under data, item at data[0] or data
      const data = res?.data;
      if (Array.isArray(data)) return data[0] ?? null;
      return data ?? null;
    },
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export const useCreateHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => client.highlights.create(data),
    onSuccess: (res: any) => {
      toast.success('Highlight created successfully');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create highlight');
    },
  });
};

export const useUpdateHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData | Record<string, any> }) =>
      client.highlights.update({ id, data }),
    onSuccess: (_, variables) => {
      toast.success('Highlight updated successfully');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'detail', String(variables.id)],
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update highlight');
    },
  });
};

export const useDeleteHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => client.highlights.delete(id),
    onSuccess: () => {
      toast.success('Highlight deleted successfully');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete highlight');
    },
  });
};

export const useToggleHighlightActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => client.highlights.toggleActive(id),
    onSuccess: (_, id) => {
      toast.success('Highlight status updated');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'detail', String(id)],
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update active status');
    },
  });
};

export const useAddHighlightElement = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: ({ highlightId, data }: { highlightId: string | number; data: FormData }) =>
      client.highlights.elements.create({ highlightId, data }),
    onSuccess: (_, variables) => {
      toast.success('Element added successfully');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'detail', String(variables.highlightId)],
      });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add element');
    },
  });
};

export const useUpdateHighlightElement = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: ({
      highlightId,
      elementId,
      data,
    }: {
      highlightId: string | number;
      elementId: string | number;
      data: FormData;
    }) => client.highlights.elements.update({ highlightId, elementId, data }),
    onSuccess: (_, variables) => {
      toast.success('Element updated successfully');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'detail', String(variables.highlightId)],
      });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update element');
    },
  });
};

export const useDeleteHighlightElement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      highlightId,
      elementId,
    }: {
      highlightId: string | number;
      elementId: string | number;
    }) => client.highlights.elements.delete({ highlightId, elementId }),
    onSuccess: (_, variables) => {
      toast.success('Element deleted successfully');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'detail', String(variables.highlightId)],
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete element');
    },
  });
};

export const useToggleHighlightElementActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      highlightId,
      elementId,
    }: {
      highlightId: string | number;
      elementId: string | number;
    }) => client.highlights.elements.toggleActive({ highlightId, elementId }),
    onSuccess: (_, variables) => {
      toast.success('Element active status updated');
      queryClient.invalidateQueries({ queryKey: [routes.highlights.index] });
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'detail', String(variables.highlightId)],
      });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to toggle element status');
    },
  });
};

export function useHighlightSettings() {
  return useQuery<any, Error>({
    queryKey: [routes.highlights.index, 'settings'],
    queryFn: async () => {
      const res: any = await client.highlights.settings.get();
      return res?.data ?? res;
    },
  });
}

export const useUpdateHighlightSettings = () => {
  const queryClient = useQueryClient();
  const { closeModal } = useModal();

  return useMutation({
    mutationFn: (data: { highlight_image_duration_seconds: number }) =>
      client.highlights.settings.update(data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({
        queryKey: [routes.highlights.index, 'settings'],
      });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update settings');
    },
  });
};
