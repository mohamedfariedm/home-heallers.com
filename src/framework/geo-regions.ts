import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/framework/utils';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { routes } from '@/config/routes';
import type {
  GeoRegion,
  GeoRegionPayload,
  GeoRegionVisit,
  PaginatedMeta,
} from '@/types/geo-regions';

export interface Paginated<T> {
  data: T[];
  meta?: Partial<PaginatedMeta>;
}

const ROOT_KEY = routes.geoRegions.index;

export function useGeoRegions(params = '', enabled = true) {
  return useQuery<Paginated<GeoRegion>, Error>({
    queryKey: [ROOT_KEY, 'list', params],
    queryFn: async () => {
      const res: any = await client.geoRegions.all(params);
      return {
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? undefined,
      };
    },
    enabled,
  });
}

export function useGeoRegion(id?: string | number) {
  return useQuery<GeoRegion | null, Error>({
    queryKey: [ROOT_KEY, 'detail', String(id ?? '')],
    queryFn: async () => {
      const res: any = await client.geoRegions.findOne(id!);
      return res?.data ?? null;
    },
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export function useGeoRegionVisits(id?: string | number, params = '') {
  return useQuery<Paginated<GeoRegionVisit>, Error>({
    queryKey: [ROOT_KEY, 'visits', String(id ?? ''), params],
    queryFn: async () => {
      const res: any = await client.geoRegions.visits(id!, params);
      return {
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? undefined,
      };
    },
    enabled: id !== undefined && id !== null && id !== '',
  });
}

export const useCreateGeoRegion = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: GeoRegionPayload) => client.geoRegions.create(data),
    onSuccess: () => {
      toast.success(t('geo_created', 'Geo region created successfully'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.message || t('geo_create_failed', 'Failed to create geo region')
      );
    },
  });
};

export const useUpdateGeoRegion = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: GeoRegionPayload;
    }) => client.geoRegions.update({ id, data }),
    onSuccess: () => {
      toast.success(t('geo_updated', 'Geo region updated successfully'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.message || t('geo_update_failed', 'Failed to update geo region')
      );
    },
  });
};

export const useDeleteGeoRegion = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string | number) => client.geoRegions.delete(id),
    onSuccess: () => {
      toast.success(t('geo_deleted', 'Geo region deleted successfully'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.message || t('geo_delete_failed', 'Failed to delete geo region')
      );
    },
  });
};

export const useToggleGeoRegionActive = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string | number) => client.geoRegions.toggleActive(id),
    onSuccess: () => {
      toast.success(t('geo_status_updated', 'Geo region status updated'));
      queryClient.invalidateQueries({ queryKey: [ROOT_KEY] });
    },
    onError: (err: any) => {
      toast.error(
        err?.message || t('geo_status_failed', 'Failed to update status')
      );
    },
  });
};
