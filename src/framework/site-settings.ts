import { routes } from '@/config/routes';
import client from '@/framework/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useSettings() {
  return useQuery<any, Error>({
    queryKey: [routes.settings.index],
    queryFn: () => client.SiteSettings.all(),
  });
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.SiteSettings.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [routes.settings.index] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error(`Error ${error?.message}`);
    },
  });
};
