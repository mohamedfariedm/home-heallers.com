import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { routes } from '@/config/routes';
import client from '@/framework/utils';
import type { Campaign, CampaignPayload } from '@/types/campaigns';

export interface Paginated<T> {
  data: T[];
  meta?: { total?: number; per_page?: number; current_page?: number };
}

const ROOT_KEY = routes.campaigns.index;

function serverMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.message || fallback;
}

export function useCampaigns(params = '', enabled = true) {
  return useQuery<Paginated<Campaign>, Error>({
    queryKey: [ROOT_KEY, 'list', params],
    queryFn: async () => {
      const res: any = await client.campaigns.all(params);
      return {
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? undefined,
      };
    },
    enabled,
  });
}

export function useCampaign(id?: string | number) {
  return useQuery<Campaign | null, Error>({
    queryKey: [ROOT_KEY, 'detail', String(id ?? '')],
    queryFn: async () => {
      const res: any = await client.campaigns.findOne(id!);
      return res?.data ?? null;
    },
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('campaigns');

  return useMutation({
    mutationFn: (data: CampaignPayload) => client.campaigns.create(data),
    onSuccess: () => {
      toast.success(t('campaigns_created'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(serverMessage(err, t('campaigns_create_failed')));
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('campaigns');

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: CampaignPayload }) =>
      client.campaigns.update({ id, data }),
    onSuccess: () => {
      toast.success(t('campaigns_updated'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(serverMessage(err, t('campaigns_update_failed')));
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('campaigns');

  return useMutation({
    mutationFn: (id: string | number) => client.campaigns.delete(id),
    onSuccess: () => {
      toast.success(t('campaigns_deleted'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(serverMessage(err, t('campaigns_delete_failed')));
    },
  });
};
